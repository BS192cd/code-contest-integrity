const express = require('express');
const router = express.Router();

const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const plagiarismService = require('../services/plagiarismService');
const { authenticate, requireTeacher } = require('../middleware/auth');

// All routes require teacher authentication
router.use(authenticate, requireTeacher);

// Get plagiarism check results
router.get('/check', async (req, res) => {
  try {
    const { contestId, problemId, threshold = 60 } = req.query;

    const query = {
      'plagiarismCheck.checked': true,
      'plagiarismCheck.score': { $gte: parseInt(threshold) }
    };

    if (contestId) query.contestId = contestId;
    if (problemId) query.problemId = problemId;

    const flaggedSubmissions = await Submission.find(query)
      .populate('userId', 'username fullName')
      .populate('problemId', 'title difficulty')
      .populate('contestId', 'title')
      .populate('plagiarismCheck.similarSubmissions.submission', 'userId code')
      .sort({ 'plagiarismCheck.score': -1 })
      .lean();

    // Group by similarity pairs
    const pairs = [];
    const processed = new Set();

    for (const submission of flaggedSubmissions) {
      for (const similar of submission.plagiarismCheck.similarSubmissions) {
        const pairKey = [submission._id, similar.submission._id].sort().join('-');
        
        if (processed.has(pairKey)) continue;
        processed.add(pairKey);

        pairs.push({
          id: pairKey,
          studentA: submission.userId.username,
          studentB: similar.submission.userId?.username || 'Unknown',
          similarity: similar.similarity,
          submissionAId: submission._id,
          submissionBId: similar.submission._id,
          problem: submission.problemId.title,
          contest: submission.contestId?.title,
          flaggedAt: submission.plagiarismCheck.checkedAt
        });
      }
    }

    const summary = {
      totalSubmissions: await Submission.countDocuments(contestId ? { contestId } : {}),
      flaggedPairs: pairs.length,
      averageSimilarity: pairs.length > 0 ? 
        pairs.reduce((sum, pair) => sum + pair.similarity, 0) / pairs.length : 0,
      scanDate: new Date()
    };

    res.json({
      success: true,
      data: {
        summary,
        pairs
      }
    });

  } catch (error) {
    console.error('Get plagiarism check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plagiarism results'
    });
  }
});

// Compare two specific submissions
router.post('/compare', async (req, res) => {
  try {
    const { submissionIdA, submissionIdB } = req.body;

    const [submissionA, submissionB] = await Promise.all([
      Submission.findById(submissionIdA).populate('userId', 'username fullName'),
      Submission.findById(submissionIdB).populate('userId', 'username fullName')
    ]);

    if (!submissionA || !submissionB) {
      return res.status(404).json({
        success: false,
        error: 'One or both submissions not found'
      });
    }

    const comparison = await plagiarismService.compareSubmissions(submissionA, submissionB);

    const result = {
      submissionA: {
        id: submissionA._id,
        username: submissionA.userId.username,
        fullName: submissionA.userId.fullName,
        submissionTime: submissionA.createdAt,
        language: submissionA.language,
        code: submissionA.code
      },
      submissionB: {
        id: submissionB._id,
        username: submissionB.userId.username,
        fullName: submissionB.userId.fullName,
        submissionTime: submissionB.createdAt,
        language: submissionB.language,
        code: submissionB.code
      },
      similarity: comparison.similarity,
      matchedLines: [], // Would be calculated by plagiarism service
      analysis: {
        structuralSimilarity: comparison.structuralSimilarity,
        variableNameSimilarity: comparison.variableNameSimilarity,
        logicSimilarity: comparison.logicSimilarity,
        commentSimilarity: comparison.commentSimilarity
      },
      details: comparison.details
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Compare submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare submissions'
    });
  }
});

// Run plagiarism scan on contest/problem
router.post('/scan', async (req, res) => {
  try {
    const { contestId, problemId, threshold = 60 } = req.body;

    if (!contestId && !problemId) {
      return res.status(400).json({
        success: false,
        error: 'Either contestId or problemId is required'
      });
    }

    // Get submissions to scan
    const query = {};
    if (contestId) query.contestId = contestId;
    if (problemId) query.problemId = problemId;
    
    // Only scan accepted submissions
    query.status = 'accepted';

    const submissions = await Submission.find(query)
      .populate('userId', 'username fullName')
      .populate('problemId', 'title')
      .limit(100); // Limit to prevent too much processing

    if (submissions.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 submissions required for plagiarism detection'
      });
    }

    // Run plagiarism scan
    const results = await plagiarismService.scanSubmissions(submissions, threshold);

    // Update submission plagiarism scores
    for (const result of results) {
      await plagiarismService.updateSubmissionPlagiarismScore(
        result.submissionA._id,
        result.similarity,
        [{ submission: result.submissionB._id, similarity: result.similarity }]
      );

      await plagiarismService.updateSubmissionPlagiarismScore(
        result.submissionB._id,
        result.similarity,
        [{ submission: result.submissionA._id, similarity: result.similarity }]
      );
    }

    const scanResult = {
      scanId: `scan_${Date.now()}`,
      contestId: contestId || null,
      problemId: problemId || null,
      threshold,
      totalSubmissions: submissions.length,
      comparisons: Math.floor(submissions.length * (submissions.length - 1) / 2),
      flaggedPairs: results.length,
      results: results.map(r => ({
        submissionA: {
          id: r.submissionA._id,
          username: r.submissionA.userId.username,
          fullName: r.submissionA.userId.fullName
        },
        submissionB: {
          id: r.submissionB._id,
          username: r.submissionB.userId.username,
          fullName: r.submissionB.userId.fullName
        },
        similarity: r.similarity,
        details: r.details
      })),
      scanCompletedAt: new Date()
    };

    res.json({
      success: true,
      data: scanResult,
      message: `Plagiarism scan completed. Found ${results.length} potential matches.`
    });

  } catch (error) {
    console.error('Plagiarism scan error:', error);
    res.status(500).json({
      success: false,
      error: 'Plagiarism scan failed'
    });
  }
});

module.exports = router;