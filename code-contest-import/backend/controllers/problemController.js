const Problem = require('../models/Problem');
const User = require('../models/User');
const { serializeMongooseData } = require('../utils/serialization');

// Get all problems with filtering
const getProblems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      difficulty = 'all', 
      category = 'all',
      search = '', 
      tags = '' 
    } = req.query;

    const query = { isActive: true };
    
    // Apply filters
    if (difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { statement: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Only show public problems to students
    if (req.user?.role === 'student') {
      query.isPublic = true;
    }

    const skip = (page - 1) * limit;
    
    const problems = await Problem.find(query)
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-testCases') // Don't include test cases in list view
      .lean();

    const total = await Problem.countDocuments(query);

    res.json({
      success: true,
      data: serializeMongooseData(problems),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: skip + problems.length < total
      }
    });

  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problems'
    });
  }
};

// Get single problem by ID
const getProblem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findById(id)
      .populate('createdBy', 'username fullName')
      .lean();

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Check access permissions
    if (!problem.isPublic && 
        req.user?.role === 'student' && 
        problem.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to private problem'
      });
    }

    // For students, only show public test cases
    if (req.user?.role === 'student') {
      problem.testCases = problem.testCases.filter(tc => tc.isPublic);
    }

    res.json({
      success: true,
      data: serializeMongooseData(problem)
    });

  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problem'
    });
  }
};

// Get problem statistics
const getProblemStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const problem = await Problem.findById(id).lean();
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    res.json({
      success: true,
      data: serializeMongooseData({
        totalSubmissions: problem.statistics.totalSubmissions,
        acceptedSubmissions: problem.statistics.acceptedSubmissions,
        acceptanceRate: problem.statistics.acceptanceRate,
        averageScore: problem.statistics.averageScore,
        difficulty: problem.difficulty,
        category: problem.category
      })
    });

  } catch (error) {
    console.error('Get problem stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problem statistics'
    });
  }
};

// Create new problem (teachers only)
const createProblem = async (req, res) => {
  try {
    const problemData = {
      ...req.body,
      createdBy: req.user._id
    };

    const problem = new Problem(problemData);
    await problem.save();

    // Populate references for response
    await problem.populate('createdBy', 'username fullName');

    res.status(201).json({
      success: true,
      data: serializeMongooseData(problem),
      message: 'Problem created successfully'
    });

  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create problem'
    });
  }
};

// Update problem (teachers only, must be creator or admin)
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this problem'
      });
    }

    Object.assign(problem, updates);
    await problem.save();

    await problem.populate('createdBy', 'username fullName');

    res.json({
      success: true,
      data: serializeMongooseData(problem),
      message: 'Problem updated successfully'
    });

  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update problem'
    });
  }
};

// Delete problem (admin only or creator)
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this problem'
      });
    }

    await Problem.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });

  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete problem'
    });
  }
};

// Add test case to problem
const addTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const testCaseData = req.body;

    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this problem'
      });
    }

    problem.testCases.push(testCaseData);
    await problem.save();

    res.json({
      success: true,
      data: serializeMongooseData(problem.testCases[problem.testCases.length - 1]),
      message: 'Test case added successfully'
    });

  } catch (error) {
    console.error('Add test case error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add test case'
    });
  }
};

// Update test case
const updateTestCase = async (req, res) => {
  try {
    const { id, testCaseId } = req.params;
    const updates = req.body;

    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this problem'
      });
    }

    const testCase = problem.testCases.id(testCaseId);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: 'Test case not found'
      });
    }

    Object.assign(testCase, updates);
    await problem.save();

    res.json({
      success: true,
      data: serializeMongooseData(testCase),
      message: 'Test case updated successfully'
    });

  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update test case'
    });
  }
};

// Delete test case
const deleteTestCase = async (req, res) => {
  try {
    const { id, testCaseId } = req.params;

    const problem = await Problem.findById(id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && 
        problem.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this problem'
      });
    }

    problem.testCases.pull(testCaseId);
    await problem.save();

    res.json({
      success: true,
      message: 'Test case deleted successfully'
    });

  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete test case'
    });
  }
};

module.exports = {
  getProblems,
  getProblem,
  getProblemStats,
  createProblem,
  updateProblem,
  deleteProblem,
  addTestCase,
  updateTestCase,
  deleteTestCase
};