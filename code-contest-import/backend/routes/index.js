const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const contestRoutes = require('./contests');
const problemRoutes = require('./problems');
const submissionRoutes = require('./submissions');
const leaderboardRoutes = require('./leaderboard');
const analyticsRoutes = require('./analytics');
const plagiarismRoutes = require('./plagiarism');
const uploadRoutes = require('./upload');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CodeContest API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API information endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CodeContest Pro API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      contests: '/api/contests',
      problems: '/api/problems',
      submissions: '/api/submissions',
      leaderboard: '/api/leaderboard',
      analytics: '/api/analytics',
      plagiarism: '/api/plagiarism',
      upload: '/api/upload'
    },
    documentation: 'https://docs.codecontest.com/api'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/contests', contestRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/plagiarism', plagiarismRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;