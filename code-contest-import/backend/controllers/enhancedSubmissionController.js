const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const EnhancedJudge0Service = require('../services/enhancedJudge0Service');

const judge0Service = new EnhancedJudge0Service();

const submitSolution = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const userId = req.user._id;

    console.log(`🚀 New submission: User ${userId} for Problem ${problemId}`);

    // Fetch problem with test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    console.log(`📋 Problem "${problem.title}" has ${problem.testCases?.length || 0} test cases`);

    // Check if problem has test cases
    if (!problem.testCases || problem.testCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'This problem has no test cases configured.'
      });
    }

    // Create submission record
    const submission = new Submission({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      processingStartedAt: new Date(),
      codeLength: code.length,
      linesOfCode: code.split('\n').length
    });

    await submission.save();
    console.log(`💾 Submission ${submission._id} created`);

    // Validate against all test cases
    try {
      console.log(`🧪 Starting validation with ${problem.testCases.length} test cases`);
      
      const validationResult = await judge0Service.validateSubmission(
        code, 
        language, 
        problem.testCases
      );

      console.log(`🏁 Validation complete: ${validationResult.status} (${validationResult.score}%)`);

      // Update submission with results
      submission.status = validationResult.status;
      submission.score = validationResult.score;
      submission.testResults = validationResult.testResults;
      submission.processingCompletedAt = new Date();

      // Calculate execution time and memory usage averages
      if (validationResult.testResults.length > 0) {
        const avgExecutionTime = validationResult.testResults.reduce((sum, tr) => sum + (tr.executionTime || 0), 0) / validationResult.testResults.length;
        const avgMemoryUsage = validationResult.testResults.reduce((sum, tr) => sum + (tr.memoryUsage || 0), 0) / validationResult.testResults.length;
        
        submission.executionTime = Math.round(avgExecutionTime);
        submission.memoryUsage = Math.round(avgMemoryUsage / 1024); // Convert to MB
      }

      await submission.save();

      // Update problem statistics
      await problem.addSubmission(submission._id, validationResult.status === 'accepted');

      console.log(`📊 Problem statistics updated`);

      res.json({
        success: true,
        data: {
          id: submission._id,
          status: submission.status,
          score: submission.score,
          executionTime: submission.executionTime,
          memoryUsage: submission.memoryUsage,
          passedTestCases: validationResult.passedTestCases,
          totalTestCases: validationResult.totalTestCases,
          testResults: validationResult.testResults.map(tr => ({
            testCaseIndex: tr.testCaseIndex,
            status: tr.status,
            input: tr.input,
            expectedOutput: tr.expectedOutput,
            actualOutput: tr.actualOutput,
            executionTime: tr.executionTime,
            memoryUsage: tr.memoryUsage,
            points: tr.points,
            errorMessage: tr.errorMessage
          })),
          createdAt: submission.createdAt,
          processingTime: submission.processingCompletedAt - submission.processingStartedAt
        }
      });

    } catch (validationError) {
      console.error(`❌ Validation failed:`, validationError.message);
      
      submission.status = 'system_error';
      submission.lastError = validationError.message;
      submission.processingCompletedAt = new Date();
      await submission.save();

      res.status(500).json({
        success: false,
        error: validationError.message,
        details: 'Validation system encountered an error. Please try again.'
      });
    }

  } catch (error) {
    console.error('❌ Submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Get submission details
const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findById(id)
      .populate('problemId', 'title difficulty')
      .populate('userId', 'username fullName');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check if user owns the submission or is admin/teacher
    if (submission.userId._id.toString() !== userId.toString() && 
        !['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get user's submissions for a problem
const getUserSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const submissions = await Submission.find({
      userId,
      problemId
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('problemId', 'title difficulty')
    .select('status score executionTime memoryUsage createdAt testResults');

    const total = await Submission.countDocuments({ userId, problemId });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: skip + submissions.length < total
      }
    });

  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all submissions (admin/teacher only)
const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, problemId, userId } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (problemId) query.problemId = problemId;
    if (userId) query.userId = userId;

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('problemId', 'title difficulty')
      .populate('userId', 'username fullName')
      .select('status score executionTime memoryUsage createdAt language');

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: skip + submissions.length < total
      }
    });

  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  submitSolution,
  getSubmission,
  getUserSubmissions,
  getAllSubmissions
};
