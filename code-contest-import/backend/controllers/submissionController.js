const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const User = require('../models/User');
const judge0Service = require('../services/judge0Service');
const enhancedJudge0Service = require('../services/enhancedJudge0Service');
const batchJudge0Service = require('../services/batchJudge0Service');
const pistonService = require('../services/pistonService');
const plagiarismService = require('../services/plagiarismService');
const enhancedPlagiarismService = require('../services/enhancedPlagiarismService');
const { serializeMongooseData } = require('../utils/serialization');

// Get execution service based on environment configuration
const getExecutionService = () => {
  const engine = process.env.CODE_EXECUTION_ENGINE || 'piston';
  
  // Use batch processing for Judge0 when there are many test cases
  if (engine === 'judge0') {
    return batchJudge0Service;
  }
  
  return engine === 'piston' ? pistonService : enhancedJudge0Service;
};

// Submit solution
const submitSolution = async (req, res) => {
  try {
    const { code, language, problemId, contestId } = req.body;
    const userId = req.user._id;

    // Validate problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Validate contest if provided
    let contest = null;
    if (contestId) {
      contest = await Contest.findById(contestId);
      if (!contest) {
        return res.status(404).json({
          success: false,
          error: 'Contest not found'
        });
      }

      // Check if user is participant
      const isParticipant = contest.participants.some(
        p => p.user.toString() === userId.toString()
      );
      if (!isParticipant && contest.registrationRequired) {
        return res.status(403).json({
          success: false,
          error: 'Must join contest before submitting'
        });
      }

      // Check if contest is active
      if (contest.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Contest is not currently active'
        });
      }

      // Check submission limits
      if (contest.rules.maxSubmissions > 0) {
        const userSubmissions = await Submission.countDocuments({
          userId,
          contestId,
          problemId
        });

        if (userSubmissions >= contest.rules.maxSubmissions) {
          return res.status(400).json({
            success: false,
            error: `Maximum ${contest.rules.maxSubmissions} submissions allowed per problem`
          });
        }
      }

      // Check allowed languages
      if (contest.rules.allowedLanguages.length > 0 && 
          !contest.rules.allowedLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          error: `Language ${language} not allowed in this contest`
        });
      }
    }

    // Create submission record
    const submission = new Submission({
      userId,
      problemId,
      contestId: contestId || null,
      code,
      language,
      status: 'pending',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await submission.save();

    // Execute code asynchronously
    executeSubmission(submission._id, problem);

    res.status(201).json({
      success: true,
      data: {
        id: submission._id,
        status: 'pending',
        submissionTime: submission.createdAt
      },
      message: 'Submission received and being processed'
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit solution'
    });
  }
};

// Get submissions for a user/problem/contest
const getSubmissions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      userId, 
      problemId, 
      contestId, 
      status = 'all',
      language = 'all'
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
    }

    const skip = (page - 1) * limit;
    
    const submissions = await Submission.find(query)
      .populate('userId', 'username fullName')
      .populate('problemId', 'title difficulty')
      .populate('contestId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-code -testResults') // Exclude code and detailed results for list view
      .lean();

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      data: serializeMongooseData(submissions),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: skip + submissions.length < total
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions'
    });
  }
};

// Get single submission details
const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    const submission = await Submission.findById(id)
      .populate('userId', 'username fullName')
      .populate('problemId', 'title difficulty testCases')
      .populate('contestId', 'title');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Check permissions
    if (req.user.role === 'student' && 
        submission.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: serializeMongooseData(submission)
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission'
    });
  }
};

// Execute submission against test cases (internal function)
const executeSubmission = async (submissionId, problem) => {
  const LeaderboardSocket = require('../sockets/leaderboardSocket');
  
  try {
    const submission = await Submission.findById(submissionId)
      .populate('userId', 'username fullName')
      .populate('problemId', 'title')
      .populate('contestId', 'title');
    
    if (!submission) return;

    // Update status to running and broadcast
    submission.status = 'running';
    await submission.save();
    
    // Broadcast status update
    if (global.leaderboardSocket) {
      await global.leaderboardSocket.broadcastNewSubmission(submission);
    }

    console.log(`Executing submission ${submissionId} for problem: ${problem.title}`);
    
    // DEBUG: Log what we're seeing
    console.log(`DEBUG - testCases length: ${problem.testCases?.length || 0}`);
    console.log(`DEBUG - visibleTestCases length: ${problem.visibleTestCases?.length || 0}`);
    console.log(`DEBUG - hiddenTestCases length: ${problem.hiddenTestCases?.length || 0}`);

    // Get test cases - handle both old and new formats
    let allTestCases = [];
    let visibleCount = 0;
    let hiddenCount = 0;
    
    if (problem.testCases && problem.testCases.length > 0) {
      // New format: testCases array with isHidden flag
      allTestCases = problem.testCases;
      visibleCount = problem.testCases.filter(tc => !tc.isHidden).length;
      hiddenCount = problem.testCases.filter(tc => tc.isHidden).length;
      console.log(`DEBUG - Using NEW format (testCases array)`);
    } else {
      // Old format: separate visibleTestCases and hiddenTestCases arrays
      allTestCases = [
        ...(problem.visibleTestCases || []),
        ...(problem.hiddenTestCases || [])
      ];
      visibleCount = problem.visibleTestCases?.length || 0;
      hiddenCount = problem.hiddenTestCases?.length || 0;
      console.log(`DEBUG - Using OLD format (separate arrays)`);
    }

    console.log(`📊 Total test cases: ${allTestCases.length} (${visibleCount} visible + ${hiddenCount} hidden)`);

    if (allTestCases.length === 0) {
      throw new Error('No test cases configured for this problem');
    }

    // Execute against test cases using configured service (Piston or Judge0)
    // Convert Mongoose document to plain object for universal wrapper
    const problemData = problem.toObject ? problem.toObject() : problem;
    const executionService = getExecutionService();
    
    const testResults = await executionService.executeWithTestCases(
      submission.code,
      submission.language,
      allTestCases,
      problem.timeLimit || 2,
      problem.memoryLimit || 256,
      problem.title || '',
      problemData
    );

    // Calculate score and status with separate tracking for visible/hidden tests
    const visibleResults = testResults.slice(0, visibleCount);
    const hiddenResults = testResults.slice(visibleCount);
    
    const passedVisible = visibleResults.filter(tr => tr.status === 'passed').length;
    const passedHidden = hiddenResults.filter(tr => tr.status === 'passed').length;
    const passedTests = passedVisible + passedHidden;
    const totalTests = testResults.length;
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    // Determine final status
    let finalStatus = 'accepted';
    let statusMessage = '';
    
    if (passedTests === 0) {
      finalStatus = 'wrong_answer';
      statusMessage = 'All test cases failed';
    } else if (passedTests < totalTests) {
      // Check for specific error types
      const hasRuntimeError = testResults.some(tr => tr.status === 'runtime_error');
      const hasTLE = testResults.some(tr => tr.status === 'tle');
      const hasMLE = testResults.some(tr => tr.status === 'mle');
      
      if (hasRuntimeError) {
        finalStatus = 'runtime_error';
        statusMessage = 'Runtime error occurred';
      } else if (hasTLE) {
        finalStatus = 'time_limit_exceeded';
        statusMessage = 'Time limit exceeded';
      } else if (hasMLE) {
        finalStatus = 'memory_limit_exceeded';
        statusMessage = 'Memory limit exceeded';
      } else {
        finalStatus = 'wrong_answer';
        if (hiddenCount > 0) {
          statusMessage = `Passed ${passedVisible}/${visibleCount} visible tests, ${passedHidden}/${hiddenCount} hidden tests`;
        } else {
          statusMessage = `Passed ${passedTests}/${totalTests} test cases`;
        }
      }
    } else {
      statusMessage = `All test cases passed! (${visibleCount} visible + ${hiddenCount} hidden)`;
    }
    
    // Store test case statistics
    submission.testCaseStats = {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      visible: {
        total: visibleCount,
        passed: passedVisible,
        failed: visibleCount - passedVisible
      },
      hidden: {
        total: hiddenCount,
        passed: passedHidden,
        failed: hiddenCount - passedHidden
      }
    };
    
    submission.statusMessage = statusMessage;

    // Update submission with results
    submission.testResults = testResults;
    submission.status = finalStatus;
    submission.score = score;
    
    // Calculate execution metrics
    if (testResults.length > 0) {
      const validTimes = testResults.filter(tr => tr.executionTime !== null).map(tr => tr.executionTime);
      const validMemory = testResults.filter(tr => tr.memoryUsage !== null).map(tr => tr.memoryUsage);
      
      submission.executionTime = validTimes.length > 0 ? Math.max(...validTimes) : null;
      submission.memoryUsage = validMemory.length > 0 ? Math.max(...validMemory) : null;
    }

    await submission.save();

    console.log(`✅ Submission ${submissionId} completed: ${finalStatus} (${score}%)`);

    // Update problem statistics
    const isAccepted = finalStatus === 'accepted';
    await updateProblemStatistics(problem._id, isAccepted, score);

    // Update user statistics
    await updateUserStatistics(submission.userId, isAccepted, score);

    // Update contest statistics and leaderboard if applicable
    if (submission.contestId) {
      await updateContestStatistics(submission.contestId, submission.userId, submission.problemId, submission);
      // Apply penalty for wrong attempts before first accepted
      try {
        const contest = await Contest.findById(submission.contestId);
        if (contest && contest.rules?.penalty?.enabled) {
          const userSubs = await Submission.find({
            userId: submission.userId,
            contestId: submission.contestId,
            problemId: submission.problemId
          }).sort({ createdAt: 1 });
          const firstAcceptedIndex = userSubs.findIndex(s => s.status === 'accepted');
          if (firstAcceptedIndex >= 0) {
            const wrongBefore = userSubs.slice(0, firstAcceptedIndex).filter(s => s.status !== 'accepted').length;
            if (wrongBefore > 0) {
              const participant = contest.participants.find(p => p.user.toString() === submission.userId.toString());
              if (participant) {
                const penaltyPoints = wrongBefore * (contest.rules.penalty.points || 0);
                participant.score = Math.max(0, participant.score - penaltyPoints);
                await contest.save();
              }
            }
          }
        }
      } catch (penErr) {
        console.error('Penalty application error:', penErr);
      }
      
      // Broadcast leaderboard update
      if (global.leaderboardSocket) {
        await global.leaderboardSocket.broadcastLeaderboardUpdate(submission.contestId);
      }
    }

    // Broadcast final submission update
    if (global.leaderboardSocket) {
      await global.leaderboardSocket.broadcastNewSubmission(submission);
    }

    // Log activity
    await logActivity({
      userId: submission.userId,
      action: 'submission_completed',
      details: {
        submissionId: submission._id,
        problemId: submission.problemId,
        contestId: submission.contestId,
        status: finalStatus,
        score: score,
        language: submission.language
      },
      timestamp: new Date()
    });

    // Check for plagiarism (async, don't wait)
    if (submission.contestId && isAccepted) {
      setImmediate(() => checkPlagiarism(submission));
    }

  } catch (error) {
    console.error(`❌ Execute submission ${submissionId} error:`, error);
    
    // Mark submission as system error
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'system_error',
      score: 0,
      testResults: [{
        testCaseIndex: 0,
        status: 'failed',
        errorMessage: 'System error during execution: ' + error.message,
        points: 0
      }]
    });

    // Broadcast error status
    if (global.leaderboardSocket) {
      const errorSubmission = await Submission.findById(submissionId)
        .populate('userId', 'username fullName')
        .populate('problemId', 'title');
      
      if (errorSubmission) {
        await global.leaderboardSocket.broadcastNewSubmission(errorSubmission);
      }
    }
  }
};

// Update problem statistics
const updateProblemStatistics = async (problemId, isAccepted, score) => {
  try {
    const updateQuery = {
      $inc: {
        'statistics.totalSubmissions': 1,
        'statistics.totalScore': score
      }
    };

    if (isAccepted) {
      updateQuery.$inc['statistics.acceptedSubmissions'] = 1;
    }

    const problem = await Problem.findByIdAndUpdate(problemId, updateQuery, { new: true });
    
    // Calculate acceptance rate and average score
    if (problem && problem.statistics && problem.statistics.totalSubmissions > 0) {
      const totalSubmissions = problem.statistics.totalSubmissions || 0;
      const acceptedSubmissions = problem.statistics.acceptedSubmissions || 0;
      const totalScore = problem.statistics.totalScore || 0;
      
      problem.statistics.acceptanceRate = totalSubmissions > 0 
        ? (acceptedSubmissions / totalSubmissions) * 100 
        : 0;
      problem.statistics.averageScore = totalSubmissions > 0 
        ? totalScore / totalSubmissions 
        : 0;
      await problem.save();
    }

  } catch (error) {
    console.error('Update problem statistics error:', error);
  }
};

// Update user statistics
const updateUserStatistics = async (userId, isAccepted, score) => {
  try {
    const updateQuery = {
      $inc: {
        'statistics.totalSubmissions': 1,
        'statistics.totalScore': score
      }
    };

    if (isAccepted) {
      updateQuery.$inc['statistics.acceptedSubmissions'] = 1;
      updateQuery.$inc['statistics.problemsSolved'] = 1;
    }

    const user = await User.findByIdAndUpdate(userId, updateQuery, { new: true });
    
    // Calculate average score
    if (user && user.statistics.totalSubmissions > 0) {
      user.statistics.averageScore = user.statistics.totalScore / user.statistics.totalSubmissions;
      
      // Update streak
      if (isAccepted) {
        user.statistics.streak += 1;
      } else {
        user.statistics.streak = 0;
      }
      
      await user.save();
    }

  } catch (error) {
    console.error('Update user statistics error:', error);
  }
};

// Activity logging function
const logActivity = async (activityData) => {
  try {
    const ActivityLog = require('../models/ActivityLog');
    
    const activity = new ActivityLog({
      userId: activityData.userId,
      action: activityData.action,
      entityType: activityData.entityType || 'submission',  // Default to submission
      entityId: activityData.entityId || activityData.details?.submissionId,  // Use submissionId from details if not provided
      details: activityData.details,
      timestamp: activityData.timestamp || new Date(),
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent
    });
    
    await activity.save();
    
    // Broadcast activity update if needed
    if (global.leaderboardSocket) {
      global.leaderboardSocket.io.emit('activity_update', {
        userId: activityData.userId,
        action: activityData.action,
        timestamp: activity.timestamp
      });
    }
    
  } catch (error) {
    console.error('Activity logging error:', error);
  }
};

// Update contest statistics and leaderboard
const updateContestStatistics = async (contestId, userId, problemId, submission) => {
  try {
    const contest = await Contest.findById(contestId);
    if (!contest) return;

    // Find participant
    const participant = contest.participants.find(p => 
      p.user.toString() === userId.toString()
    );
    
    if (!participant) return;

    // Update or add submission for this problem
    const existingSubmission = participant.submissions.find(s => 
      s.problem.toString() === problemId.toString()
    );

    if (existingSubmission) {
      // Update if this submission has higher score
      if (submission.score > existingSubmission.score) {
        existingSubmission.submission = submission._id;
        existingSubmission.score = submission.score;
        existingSubmission.submittedAt = submission.createdAt;
      }
    } else {
      // Add new submission
      participant.submissions.push({
        problem: problemId,
        submission: submission._id,
        score: submission.score,
        submittedAt: submission.createdAt
      });
    }

    // Recalculate participant's total score
    participant.score = participant.submissions.reduce((total, sub) => total + sub.score, 0);

    // Update contest statistics
    contest.statistics.totalSubmissions += 1;
    
    await contest.save();

    // Update leaderboard rankings (could be optimized with a separate job)
    await updateLeaderboardRankings(contestId);

  } catch (error) {
    console.error('Update contest statistics error:', error);
  }
};

// Update leaderboard rankings
const updateLeaderboardRankings = async (contestId) => {
  try {
    const contest = await Contest.findById(contestId);
    if (!contest) return;

    // Sort participants by score (descending)
    contest.participants.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      
      // Tiebreaker: earliest submission time for same score
      const aLastSubmission = Math.max(...a.submissions.map(s => new Date(s.submittedAt)));
      const bLastSubmission = Math.max(...b.submissions.map(s => new Date(s.submittedAt)));
      
      return aLastSubmission - bLastSubmission;
    });

    // Assign rankings
    contest.participants.forEach((participant, index) => {
      participant.rank = index + 1;
    });

    await contest.save();

  } catch (error) {
    console.error('Update leaderboard rankings error:', error);
  }
};

// Check plagiarism (async)
const checkPlagiarism = async (submission) => {
  try {
    console.log(`🔍 Starting plagiarism check for submission ${submission._id}`);
    
    // Get other submissions for the same problem in the contest
    const otherSubmissions = await Submission.find({
      contestId: submission.contestId,
      problemId: submission.problemId,
      userId: { $ne: submission.userId },
      language: submission.language,
      status: 'accepted',
      createdAt: { $lt: submission.createdAt } // Only check against earlier submissions
    }).limit(50).populate('userId', 'username fullName');

    // Also gather same user's historical submissions for the same problem
    const selfSubmissions = await Submission.find({
      contestId: submission.contestId,
      problemId: submission.problemId,
      userId: submission.userId,
      _id: { $ne: submission._id },
      createdAt: { $lt: submission.createdAt }
    }).limit(20);

    if (otherSubmissions.length === 0 && selfSubmissions.length === 0) {
      console.log(`ℹ️  No submissions found for plagiarism comparison`);
      return;
    }

    console.log(`🔍 Comparing against ${otherSubmissions.length} other submissions and ${selfSubmissions.length} self submissions`);

    let maxSimilarity = 0;
    const similarSubmissions = [];

    // Check similarity with other submissions
    for (const otherSubmission of otherSubmissions) {
      try {
        const comparison = await enhancedPlagiarismService.compareSubmissions(
          submission, 
          otherSubmission
        );

        if (comparison.similarity >= 50) { // Lower threshold for detection
          similarSubmissions.push({
            submission: otherSubmission._id,
            similarity: comparison.similarity,
            details: comparison.details,
            userId: otherSubmission.userId._id,
            username: otherSubmission.userId.username
          });

          maxSimilarity = Math.max(maxSimilarity, comparison.similarity);

          // If high similarity, update both submissions
          if (comparison.similarity >= 70) {
            await enhancedPlagiarismService.updateSubmissionPlagiarismScore(
              otherSubmission._id,
              Math.max(otherSubmission.plagiarismCheck?.score || 0, comparison.similarity),
              [{ 
                submission: submission._id, 
                similarity: comparison.similarity,
                details: comparison.details 
              }]
            );

            console.log(`🚨 High similarity detected: ${comparison.similarity}% between submissions ${submission._id} and ${otherSubmission._id}`);
          }
        }
      } catch (comparisonError) {
        console.error(`Error comparing with submission ${otherSubmission._id}:`, comparisonError);
      }
    }

    // Check similarity with user's own historical submissions
    for (const prev of selfSubmissions) {
      try {
        const comparison = await enhancedPlagiarismService.compareSubmissions(
          submission,
          prev
        );

        if (comparison.similarity >= 60) { // stricter threshold for self-copy
          similarSubmissions.push({
            submission: prev._id,
            similarity: comparison.similarity,
            details: comparison.details,
            userId: submission.userId,
            username: submission.userId.username || 'self'
          });
          maxSimilarity = Math.max(maxSimilarity, comparison.similarity);
        }
      } catch (comparisonError) {
        console.error(`Error comparing with self submission ${prev._id}:`, comparisonError);
      }
    }

    // Update current submission's plagiarism data
    if (similarSubmissions.length > 0) {
      await enhancedPlagiarismService.updateSubmissionPlagiarismScore(
        submission._id,
        maxSimilarity,
        similarSubmissions
      );

      // Log plagiarism detection activity
      await logActivity({
        userId: submission.userId,
        action: 'plagiarism_detected',
        details: {
          submissionId: submission._id,
          problemId: submission.problemId,
          contestId: submission.contestId,
          maxSimilarity: maxSimilarity,
          similarSubmissionsCount: similarSubmissions.length,
          flaggedSubmissions: similarSubmissions.filter(s => s.similarity >= 70)
        },
        timestamp: new Date()
      });

      // Notify contest host if high similarity
      if (maxSimilarity >= 70 && global.leaderboardSocket) {
        const contest = await Contest.findById(submission.contestId).populate('createdBy', 'username email');
        if (contest && contest.createdBy) {
          global.leaderboardSocket.io.emit('plagiarism_alert', {
            contestId: submission.contestId,
            hostId: contest.createdBy._id,
            submissionId: submission._id,
            similarity: maxSimilarity,
            studentUsername: submission.userId.username,
            problemTitle: submission.problemId.title
          });
        }
      }

      console.log(`✅ Plagiarism check completed: ${maxSimilarity}% max similarity, ${similarSubmissions.length} similar submissions found`);
    } else {
      console.log(`✅ Plagiarism check completed: No similar submissions found`);
    }

  } catch (error) {
    console.error('❌ Plagiarism check error:', error);
    
    // Log the error but don't fail the submission
    await logActivity({
      userId: submission.userId,
      action: 'plagiarism_check_failed',
      details: {
        submissionId: submission._id,
        error: error.message
      },
      timestamp: new Date()
    });
  }
};

// Run code with custom input (for testing)
const runCode = async (req, res) => {
  try {
    const { code, language, input = '', problemId } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    // Validate language is supported
    const supportedLanguages = judge0Service.getSupportedLanguages();
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Language ${language} is not supported`
      });
    }

    // If problemId provided, run against public (visible) test cases
    if (problemId) {
      // Force fresh fetch from database - bypass any caching by using findOne with exec()
      const problem = await Problem.findOne({ _id: problemId }).exec();
      if (!problem) {
        return res.status(404).json({ success: false, error: 'Problem not found' });
      }
      
      // Convert to plain object to get fresh data
      const problemData = problem.toObject();
      
      // CRITICAL FIX: Use testCases (new unified schema) ONLY - ignore old visibleTestCases
      // This prevents cache issues where old visibleTestCases are used instead of updated testCases
      let publicTests = [];
      
      if (problemData.testCases && problemData.testCases.length > 0) {
        // Use testCases array - filter for non-hidden test cases
        publicTests = problemData.testCases.filter(tc => tc.isPublic === true || tc.isHidden === false);
        
        // If no public tests found, use all test cases (for problems without visibility flags)
        if (publicTests.length === 0) {
          publicTests = problemData.testCases;
        }
      }
      
      console.log(`🧪 Running code against ${publicTests.length} test cases for problem: ${problemData.title}`);
      console.log(`📝 First test case input: ${publicTests[0]?.input?.substring(0, 50)}...`);
      console.log(`📝 First test case expected: ${publicTests[0]?.expectedOutput || publicTests[0]?.output}`);
      
      if (publicTests.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No test cases available for this problem' 
        });
      }
      const executionService = getExecutionService();
      
      const results = await executionService.executeWithTestCases(
        code,
        language,
        publicTests,
        problem.timeLimit || 2,
        problem.memoryLimit || 256,
        problem.title || '',
        problemData
      );

      return res.json({
        success: true,
        data: {
          results,
          passed: results.filter(r => r.status === 'passed').length,
          total: results.length
        }
      });
    }

    // Otherwise execute with custom input
    const result = await judge0Service.submitCode(code, language, input);
    let executionResult;
    if (result.token) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      executionResult = await judge0Service.getSubmissionResult(result.token);
    } else {
      executionResult = result;
    }

    const response = {
      status: judge0Service.mapStatusToInternal(executionResult.status || { id: 3 }),
      output: executionResult.stdout || '',
      error: executionResult.stderr || executionResult.compile_output || '',
      executionTime: executionResult.time ? parseFloat(executionResult.time) * 1000 : null,
      memoryUsage: executionResult.memory ? Math.round(executionResult.memory / 1024) : null
    };

    res.json({ success: true, data: response });

  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      error: 'Code execution failed',
      details: error.message
    });
  }
};

// Rerun submission (teachers/admin only)
const rerunSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id).populate('problemId');
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Reset submission status
    submission.status = 'pending';
    submission.testResults = [];
    submission.score = 0;
    await submission.save();

    // Execute again
    executeSubmission(submission._id, submission.problemId);

    res.json({
      success: true,
      message: 'Submission queued for rerun'
    });

  } catch (error) {
    console.error('Rerun submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rerun submission'
    });
  }
};

module.exports = {
  submitSolution,
  getSubmissions,
  getSubmission,
  runCode,
  rerunSubmission
};