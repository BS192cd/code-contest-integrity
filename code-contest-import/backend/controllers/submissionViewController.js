const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { logActivity } = require('../middleware/activityLogger');
const { serializeMongooseData } = require('../utils/serialization');

// Get submissions with enhanced filtering and real-time updates
const getSubmissionsEnhanced = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      userId, 
      problemId, 
      contestId, 
      status = 'all',
      language = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeCode = false,
      includePlagiarism = false
    } = req.query;

    const query = {};
    
    // Apply filters
    if (userId) query.userId = userId;
    if (problemId) query.problemId = problemId;
    if (contestId) query.contestId = contestId;
    if (status !== 'all') query.status = status;
    if (language !== 'all') query.language = language;

    // Check permissions
    if (req.user.role === 'student') {
      // Students can only see their own submissions
      query.userId = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Teachers can see submissions for contests they created
      if (contestId) {
        const contest = await Contest.findById(contestId);
        if (contest && contest.createdBy.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Access denied to this contest\'s submissions'
          });
        }
      }
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Build projection based on permissions and request
    let selectFields = '-__v';
    if (!includeCode && req.user.role === 'student') {
      selectFields += ' -code'; // Hide code for students in list view
    }
    if (!includePlagiarism && req.user.role === 'student') {
      selectFields += ' -plagiarismCheck';
    }
    
    const submissions = await Submission.find(query)
      .populate('userId', 'username fullName avatar')
      .populate('problemId', 'title difficulty category')
      .populate('contestId', 'title status')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select(selectFields)
      .lean();

    const total = await Submission.countDocuments(query);

    // Enhance submissions with additional data
    const enhancedSubmissions = submissions.map(submission => ({
      ...submission,
      passedTestCases: submission.testResults ? submission.testResults.filter(tr => tr.status === 'passed').length : 0,
      totalTestCases: submission.testResults ? submission.testResults.length : 0,
      scorePercentage: submission.score || 0,
      executionTimeFormatted: submission.executionTime ? `${submission.executionTime}ms` : 'N/A',
      memoryUsageFormatted: submission.memoryUsage ? `${submission.memoryUsage}MB` : 'N/A',
      plagiarismStatus: submission.plagiarismCheck?.checked ? 
        (submission.plagiarismCheck.score >= 70 ? 'high' : 
         submission.plagiarismCheck.score >= 50 ? 'medium' : 'low') : 'unchecked'
    }));

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'submissions_viewed',
      details: {
        filters: { userId, problemId, contestId, status, language },
        resultCount: enhancedSubmissions.length,
        page: parseInt(page)
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: serializeMongooseData(enhancedSubmissions),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: skip + enhancedSubmissions.length < total,
        limit: parseInt(limit)
      },
      filters: {
        status,
        language,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Get enhanced submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions'
    });
  }
};

// Get detailed submission view with full results
const getSubmissionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeCode = true, includeSimilar = false } = req.query;
    
    const submission = await Submission.findById(id)
      .populate('userId', 'username fullName avatar email')
      .populate('problemId', 'title difficulty category statement examples constraints')
      .populate('contestId', 'title status createdBy')
      .populate('plagiarismCheck.similarSubmissions.submission', 'userId createdAt language');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check permissions
    const isOwner = submission.userId._id.toString() === req.user._id.toString();
    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';
    const isContestHost = submission.contestId && 
      submission.contestId.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isTeacher && !isAdmin && !isContestHost) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this submission'
      });
    }

    // Prepare response based on permissions
    const response = {
      id: submission._id,
      userId: submission.userId._id,
      username: submission.userId.username,
      fullName: submission.userId.fullName,
      avatar: submission.userId.avatar,
      problem: {
        id: submission.problemId._id,
        title: submission.problemId.title,
        difficulty: submission.problemId.difficulty,
        category: submission.problemId.category
      },
      contest: submission.contestId ? {
        id: submission.contestId._id,
        title: submission.contestId.title,
        status: submission.contestId.status
      } : null,
      language: submission.language,
      status: submission.status,
      score: submission.score,
      executionTime: submission.executionTime,
      memoryUsage: submission.memoryUsage,
      submittedAt: submission.createdAt,
      testResults: submission.testResults || [],
      passedTestCases: submission.testResults ? submission.testResults.filter(tr => tr.status === 'passed').length : 0,
      totalTestCases: submission.testResults ? submission.testResults.length : 0
    };

    // Include code based on permissions and request
    if (includeCode && (isOwner || isTeacher || isAdmin || isContestHost)) {
      response.code = submission.code;
    }

    // Include plagiarism data based on permissions
    if (submission.plagiarismCheck && submission.plagiarismCheck.checked) {
      response.plagiarismCheck = {
        score: submission.plagiarismCheck.score,
        checkedAt: submission.plagiarismCheck.checkedAt,
        status: submission.plagiarismCheck.score >= 70 ? 'high' : 
                submission.plagiarismCheck.score >= 50 ? 'medium' : 'low'
      };

      // Include similar submissions for teachers/admins
      if ((isTeacher || isAdmin || isContestHost) && includeSimilar) {
        response.plagiarismCheck.similarSubmissions = submission.plagiarismCheck.similarSubmissions.map(sim => ({
          submissionId: sim.submission._id,
          similarity: sim.similarity,
          details: sim.details,
          userId: sim.submission.userId,
          submittedAt: sim.submission.createdAt,
          language: sim.submission.language
        }));
      }
    }

    // Log activity
    await logActivity({
      userId: req.user._id,
      action: 'submission_details_viewed',
      details: {
        submissionId: id,
        submissionOwner: submission.userId._id,
        problemId: submission.problemId._id,
        contestId: submission.contestId?._id,
        includeCode: includeCode && (isOwner || isTeacher || isAdmin || isContestHost),
        includeSimilar
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      data: serializeMongooseData(response)
    });

  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission details'
    });
  }
};

// Get submission statistics for a user
const getUserSubmissionStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = userId || req.user._id;

    // Check permissions
    if (req.user.role === 'student' && targetUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get submission statistics
    const stats = await Submission.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(targetUserId) } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          acceptedSubmissions: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          averageScore: { $avg: '$score' },
          totalScore: { $sum: '$score' },
          languageStats: {
            $push: {
              language: '$language',
              status: '$status',
              score: '$score'
            }
          }
        }
      }
    ]);

    // Get language-wise statistics
    const languageStats = await Submission.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(targetUserId) } },
      {
        $group: {
          _id: '$language',
          submissions: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          averageScore: { $avg: '$score' }
        }
      },
      { $sort: { submissions: -1 } }
    ]);

    // Get recent submission activity
    const recentActivity = await Submission.find({ userId: targetUserId })
      .populate('problemId', 'title difficulty')
      .populate('contestId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('status score language createdAt problemId contestId');

    const result = {
      overview: stats[0] || {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        averageScore: 0,
        totalScore: 0
      },
      languageStats,
      recentActivity,
      acceptanceRate: stats[0] ? (stats[0].acceptedSubmissions / stats[0].totalSubmissions * 100) : 0
    };

    res.json({
      success: true,
      data: serializeMongooseData(result)
    });

  } catch (error) {
    console.error('Get user submission stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission statistics'
    });
  }
};

// Get real-time submission feed for a contest
const getContestSubmissionFeed = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { limit = 50 } = req.query;

    // Verify contest access
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found'
      });
    }

    // Check if user has access to this contest
    const isParticipant = contest.participants.some(p => p.user.toString() === req.user._id.toString());
    const isHost = contest.createdBy.toString() === req.user._id.toString();
    const isTeacher = req.user.role === 'teacher' || req.user.role === 'admin';

    if (!isParticipant && !isHost && !isTeacher) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this contest'
      });
    }

    // Get recent submissions for the contest
    const submissions = await Submission.find({ contestId })
      .populate('userId', 'username fullName avatar')
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('userId problemId language status score createdAt executionTime')
      .lean();

    // Format submissions for feed
    const feed = submissions.map(submission => ({
      id: submission._id,
      username: submission.userId.username,
      fullName: submission.userId.fullName,
      avatar: submission.userId.avatar,
      problemTitle: submission.problemId.title,
      problemDifficulty: submission.problemId.difficulty,
      language: submission.language,
      status: submission.status,
      score: submission.score,
      executionTime: submission.executionTime,
      submittedAt: submission.createdAt,
      timeAgo: getTimeAgo(submission.createdAt)
    }));

    res.json({
      success: true,
      data: serializeMongooseData({
        contestId,
        contestTitle: contest.title,
        feed,
        totalSubmissions: submissions.length,
        lastUpdated: new Date()
      })
    });

  } catch (error) {
    console.error('Get contest submission feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission feed'
    });
  }
};

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

module.exports = {
  getSubmissionsEnhanced,
  getSubmissionDetails,
  getUserSubmissionStats,
  getContestSubmissionFeed
};