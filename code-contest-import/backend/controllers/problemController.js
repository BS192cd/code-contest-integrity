const Problem = require('../models/Problem');
const User = require('../models/User');
const { serializeMongooseData } = require('../utils/serialization');

// Get all problems with filtering
const getProblems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
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
        { description: { $regex: search, $options: 'i' } }
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
      .select('-hiddenTestCases') // Don't include hidden test cases in list view
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
    
    // Force fresh fetch from database - bypass any caching
    const problem = await Problem.findOne({ _id: id })
      .populate('createdBy', 'username fullName')
      .exec();

    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Convert to plain object
    const problemData = problem.toObject();

    // Check access permissions
    if (!problemData.isPublic && 
        req.user?.role === 'student' && 
        problemData.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to private problem'
      });
    }

    // For students, only show visible test cases (hide hidden ones)
    if (req.user?.role === 'student') {
      // Students can only see visible test cases, not hidden ones
      problemData.hiddenTestCases = [];
    }

    // Set cache-control headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      data: serializeMongooseData(problemData)
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

    console.log('=== UPDATE PROBLEM REQUEST ===');
    console.log('Problem ID:', id);
    console.log('Update data keys:', Object.keys(updates));
    console.log('User:', req.user?.username, 'Role:', req.user?.role);

    const problem = await Problem.findById(id);
    
    if (!problem) {
      console.log('❌ Problem not found:', id);
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    console.log('✅ Problem found:', problem.title);

    // Check permissions - Allow all teachers and admins to update
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      console.log('❌ Permission denied - not a teacher or admin');
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this problem'
      });
    }

    console.log('✅ Permission granted');

    // Filter out unknown fields that might cause issues
    const allowedFields = [
      'title', 'description', 'difficulty', 'category', 'timeLimit', 'memoryLimit',
      'inputFormat', 'outputFormat', 'constraints', 'tags', 'examples',
      'testCases', 'visibleTestCases', 'hiddenTestCases', 'hints',
      'isPublic', 'isActive', 'solutionTemplate', 'metadata', 'signature',
      'executionType', 'problemCategory', 'source', 'sourceUrl',
      'sampleInput', 'sampleOutput', 'statement'
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key];
      } else {
        console.log(`⚠️  Ignoring unknown field: ${key}`);
      }
    });

    // Sanitize test case arrays to ensure proper structure
    if (filteredUpdates.testCases && Array.isArray(filteredUpdates.testCases)) {
      console.log(`Sanitizing ${filteredUpdates.testCases.length} test cases`);
      // Filter out test cases with empty input or output, then map
      filteredUpdates.testCases = filteredUpdates.testCases
        .filter(tc => {
          const hasInput = tc.input && tc.input.trim() !== '';
          const hasOutput = (tc.expectedOutput && tc.expectedOutput.trim() !== '') || 
                           (tc.output && tc.output.trim() !== '');
          return hasInput && hasOutput;
        })
        .map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput || tc.output,
          explanation: tc.explanation || '',
          isHidden: tc.isHidden !== undefined ? tc.isHidden : false,
          isPublic: tc.isPublic !== undefined ? tc.isPublic : (tc.isHidden !== undefined ? !tc.isHidden : true),
          points: tc.points || 10,
          order: tc.order !== undefined ? tc.order : 0
        }));
      console.log(`✅ Filtered to ${filteredUpdates.testCases.length} valid test cases`);
      
      // CRITICAL FIX: Clear old visibleTestCases and hiddenTestCases to prevent cache issues
      // When testCases is updated, we must clear the old schema fields
      filteredUpdates.visibleTestCases = [];
      filteredUpdates.hiddenTestCases = [];
      console.log('🗑️  Cleared old visibleTestCases and hiddenTestCases fields');
    }

    if (filteredUpdates.visibleTestCases && Array.isArray(filteredUpdates.visibleTestCases)) {
      console.log(`Sanitizing ${filteredUpdates.visibleTestCases.length} visible test cases`);
      filteredUpdates.visibleTestCases = filteredUpdates.visibleTestCases
        .filter(tc => tc.input && tc.input.trim() !== '' && tc.output && tc.output.trim() !== '')
        .map(tc => ({
          input: tc.input,
          output: tc.output,
          explanation: tc.explanation || ''
        }));
      console.log(`✅ Filtered to ${filteredUpdates.visibleTestCases.length} valid visible test cases`);
    }

    if (filteredUpdates.hiddenTestCases && Array.isArray(filteredUpdates.hiddenTestCases)) {
      console.log(`Sanitizing ${filteredUpdates.hiddenTestCases.length} hidden test cases`);
      filteredUpdates.hiddenTestCases = filteredUpdates.hiddenTestCases
        .filter(tc => tc.input && tc.input.trim() !== '' && tc.output && tc.output.trim() !== '')
        .map(tc => ({
          input: tc.input,
          output: tc.output
        }));
      console.log(`✅ Filtered to ${filteredUpdates.hiddenTestCases.length} valid hidden test cases`);
    }

    // Apply updates
    console.log('Applying updates...');
    Object.assign(problem, filteredUpdates);
    problem.updatedAt = new Date();
    
    // Save with validation
    console.log('Saving problem...');
    await problem.save();
    console.log('✅ Problem saved successfully');

    await problem.populate('createdBy', 'username fullName');

    res.json({
      success: true,
      data: serializeMongooseData(problem),
      message: 'Problem updated successfully'
    });

  } catch (error) {
    console.error('❌ Update problem error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to update problem';
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => 
        `${key}: ${error.errors[key].message}`
      );
      errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
      console.error('Validation errors:', validationErrors);
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
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

    // Check permissions - allow admin or teacher role
    // Teachers can delete any problem (for managing the problem bank)
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
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

    // Add to visible or hidden test cases based on the data
    if (testCaseData.isPublic || testCaseData.explanation) {
      problem.visibleTestCases.push(testCaseData);
    } else {
      problem.hiddenTestCases.push(testCaseData);
    }
    await problem.save();

    res.json({
      success: true,
      data: serializeMongooseData(testCaseData),
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

// Generate comprehensive test cases for a problem using Gemini AI
const generateTestCases = async (req, res) => {
  try {
    const { id } = req.params;
    const problemData = req.body;

    // Use Gemini AI for intelligent test case generation
    const geminiTestCaseService = require('../services/geminiTestCaseService');
    
    console.log('🤖 Generating test cases with Gemini AI...');
    
    // Generate test cases using Gemini
    let generatedCases = await geminiTestCaseService.generateTestCases(
      problemData.title || 'Problem',
      problemData.description || problemData.statement || '',
      problemData.inputFormat || 'Standard input',
      problemData.outputFormat || 'Standard output',
      problemData.constraints || 'Standard constraints',
      5 // Generate 5 test cases by default
    );

    // Optionally save to database if problem exists
    if (id && id !== 'new') {
      const problem = await Problem.findById(id);
      if (problem) {
        // Check for duplicates against existing test cases
        const existingInputs = new Set(
          (problem.testCases || []).map(tc => 
            (tc.input || '').toString().replace(/\s+/g, ' ').trim()
          )
        );
        
        // Filter out duplicates
        const newUniqueCases = generatedCases.filter(tc => {
          const normalizedInput = tc.input.replace(/\s+/g, ' ').trim();
          return !existingInputs.has(normalizedInput);
        });
        
        if (newUniqueCases.length < generatedCases.length) {
          console.log(`⚠️  Filtered out ${generatedCases.length - newUniqueCases.length} duplicate test cases that already exist`);
        }
        
        problem.testCases = [...(problem.testCases || []), ...newUniqueCases];
        await problem.save();
        console.log(`✅ Saved ${newUniqueCases.length} unique test cases to problem ${id}`);
        
        // Update the response to reflect actual saved count
        generatedCases = newUniqueCases;
      }
    }

    res.json({
      success: true,
      data: {
        testCases: generatedCases,
        count: generatedCases.length
      },
      message: `✨ Generated ${generatedCases.length} AI-powered test cases with Gemini`
    });

  } catch (error) {
    console.error('❌ Generate test cases error:', error);
    
    // Determine the specific error type and provide helpful message
    const status = error.response?.status;
    const errorCode = error.response?.data?.error?.code;
    const errorMessage = error.response?.data?.error?.message;
    
    let userMessage = '';
    let statusCode = 500;
    
    if (status === 503 || errorCode === 503) {
      userMessage = '🔄 Gemini API is currently overloaded. Please wait 1-2 minutes and try again.';
      statusCode = 503;
    } else if (status === 429 || errorCode === 429) {
      userMessage = '⏱️ Rate limit reached. Please wait a few minutes before generating more test cases.';
      statusCode = 429;
    } else if (status === 401 || errorCode === 401) {
      userMessage = '🔑 API key is invalid or expired. Please check your Gemini API configuration.';
      statusCode = 401;
    } else if (error.message.includes('API key not configured')) {
      userMessage = '⚙️ Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.';
      statusCode = 500;
    } else if (error.message.includes('timeout')) {
      userMessage = '⏰ Request timed out. Gemini is taking too long to respond. Please try again.';
      statusCode = 504;
    } else {
      userMessage = `❌ Failed to generate test cases: ${errorMessage || error.message}`;
      statusCode = 500;
    }
    
    res.status(statusCode).json({
      success: false,
      error: userMessage,
      details: {
        type: status === 503 ? 'server_overloaded' : 
              status === 429 ? 'rate_limit' : 
              status === 401 ? 'invalid_api_key' : 'unknown_error',
        message: errorMessage || error.message,
        suggestion: status === 503 ? 'Wait 1-2 minutes and try again' :
                   status === 429 ? 'Wait a few minutes before retrying' :
                   status === 401 ? 'Check your API key configuration' :
                   'Contact support if the issue persists'
      }
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
  deleteTestCase,
  generateTestCases
};