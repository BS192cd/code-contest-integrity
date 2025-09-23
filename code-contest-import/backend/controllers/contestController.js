const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { serializeMongooseData } = require('../utils/serialization');

// Get all contests with filtering
const getContests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'all', 
      difficulty = 'all', 
      search = '', 
      tags = '' 
    } = req.query;

    const query = {};
    
    // Apply filters
    if (status !== 'all') {
      query.status = status;
    }
    
    if (difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Only show public contests to students, unless they created it
    if (req.user?.role === 'student') {
      query.$or = [
        { isPublic: true },
        { createdBy: req.user._id }
      ];
    }

    const skip = (page - 1) * limit;
    
    const contests = await Contest.find(query)
      .populate('createdBy', 'username fullName')
      .populate('problems.problem', 'title difficulty')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Contest.countDocuments(query);

    // Update contest statuses based on current time
    const now = new Date();
    contests.forEach(contest => {
      if (now < new Date(contest.startTime)) contest.status = 'upcoming';
      else if (now > new Date(contest.endTime)) contest.status = 'ended';
      else contest.status = 'active';
    });

    res.json({
      success: true,
      data: serializeMongooseData(contests),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: skip + contests.length < total
      }
    });

  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contests'
    });
  }
};

// Get single contest by ID
const getContest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contest = await Contest.findById(id)
      .populate('createdBy', 'username fullName')
      .populate({
        path: 'problems.problem',
        select: 'title difficulty statement examples timeLimit memoryLimit'
      })
      .populate('participants.user', 'username fullName')
      .lean();

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Check access permissions
    if (!contest.isPublic && 
        req.user?.role === 'student' && 
        contest.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to private contest'
      });
    }

    // Update contest status
    const now = new Date();
    if (now < new Date(contest.startTime)) contest.status = 'upcoming';
    else if (now > new Date(contest.endTime)) contest.status = 'ended';
    else contest.status = 'active';

    // Since we used .lean(), we need to update the status in the database separately
    await Contest.findByIdAndUpdate(id, { status: contest.status });

    res.json({
      success: true,
      data: serializeMongooseData(contest)
    });

  } catch (error) {
    console.error('Get contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contest'
    });
  }
};

// Create new contest (teachers only)
const createContest = async (req, res) => {
  try {
    const contestData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Calculate duration in minutes
    const startTime = new Date(contestData.startTime);
    const endTime = new Date(contestData.endTime);
    contestData.duration = Math.round((endTime - startTime) / (1000 * 60));

    const contest = new Contest(contestData);
    await contest.save();

    // Populate references for response
    await contest.populate('createdBy', 'username fullName');
    await contest.populate('problems.problem', 'title difficulty');

    // Add contest ID to user's created contests
    await User.findByIdAndUpdate(req.user._id, {
      $push: { contestsCreated: contest._id }
    });

    res.status(201).json({
      success: true,
      data: serializeMongooseData(contest),
      message: 'Contest created successfully'
    });

  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contest'
    });
  }
};

// Update contest (teachers only, must be creator or admin)
const updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contest = await Contest.findById(id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        contest.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this contest'
      });
    }

    // Don't allow updates to active contests
    if (contest.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update active contest'
      });
    }

    // Recalculate duration if times are updated
    if (updates.startTime || updates.endTime) {
      const startTime = new Date(updates.startTime || contest.startTime);
      const endTime = new Date(updates.endTime || contest.endTime);
      updates.duration = Math.round((endTime - startTime) / (1000 * 60));
    }

    Object.assign(contest, updates);
    await contest.save();

    await contest.populate('createdBy', 'username fullName');
    await contest.populate('problems.problem', 'title difficulty');

    res.json({
      success: true,
      data: serializeMongooseData(contest),
      message: 'Contest updated successfully'
    });

  } catch (error) {
    console.error('Update contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contest'
    });
  }
};

// Delete contest (admin only or creator)
const deleteContest = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        contest.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this contest'
      });
    }

    // Don't allow deletion of active contests
    if (contest.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete active contest'
      });
    }

    await Contest.findByIdAndDelete(id);

    // Remove from user's created contests
    await User.findByIdAndUpdate(contest.createdBy, {
      $pull: { contestsCreated: id }
    });

    res.json({
      success: true,
      message: 'Contest deleted successfully'
    });

  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contest'
    });
  }
};

// Join contest
const joinContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Check if contest is joinable
    if (contest.status === 'ended') {
      return res.status(400).json({
        success: false,
        error: 'Contest has ended'
      });
    }

    if (contest.registrationRequired && contest.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Registration period has ended'
      });
    }

    // Check if already joined
    const existingParticipant = contest.participants.find(
      p => p.user.toString() === userId.toString()
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        error: 'Already joined this contest'
      });
    }

    // Check participant limit
    if (contest.participants.length >= contest.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: 'Contest is full'
      });
    }

    // Add participant
    contest.participants.push({ user: userId });
    contest.statistics.totalParticipants += 1;
    await contest.save();

    // Add to user's joined contests
    await User.findByIdAndUpdate(userId, {
      $push: { 
        contestsJoined: { 
          contest: id,
          joinedAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully joined contest'
    });

  } catch (error) {
    console.error('Join contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join contest'
    });
  }
};

// Leave contest (before it starts)
const leaveContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(id);
    
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Can only leave before contest starts
    if (contest.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        error: 'Cannot leave contest after it has started'
      });
    }

    // Remove participant
    contest.participants = contest.participants.filter(
      p => p.user.toString() !== userId.toString()
    );
    contest.statistics.totalParticipants = Math.max(0, contest.statistics.totalParticipants - 1);
    await contest.save();

    // Remove from user's joined contests
    await User.findByIdAndUpdate(userId, {
      $pull: { 'contestsJoined.contest': id }
    });

    res.json({
      success: true,
      message: 'Successfully left contest'
    });

  } catch (error) {
    console.error('Leave contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave contest'
    });
  }
};

module.exports = {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  joinContest,
  leaveContest
};