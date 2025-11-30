/**
 * Judge0 Status and Control Routes
 * Provides endpoints to monitor and control the Judge0 fallback system
 */

const express = require('express');
const router = express.Router();
const judge0Fallback = require('../services/judge0FallbackService');
const { authenticate, requireTeacher } = require('../middleware/auth');

/**
 * GET /api/judge0-status
 * Get current Judge0 status and statistics
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const stats = judge0Fallback.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting Judge0 status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/judge0-status/health-check
 * Force a health check
 */
router.post('/health-check', authenticate, requireTeacher, async (req, res) => {
  try {
    const stats = await judge0Fallback.forceHealthCheck();
    
    res.json({
      success: true,
      message: 'Health check completed',
      data: stats
    });
  } catch (error) {
    console.error('Error performing health check:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/judge0-status/reset-stats
 * Reset statistics (teachers only)
 */
router.post('/reset-stats', authenticate, requireTeacher, async (req, res) => {
  try {
    judge0Fallback.resetStats();
    
    res.json({
      success: true,
      message: 'Statistics reset successfully'
    });
  } catch (error) {
    console.error('Error resetting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/judge0-status/test
 * Test code execution (for debugging)
 */
router.post('/test', authenticate, requireTeacher, async (req, res) => {
  try {
    const { code, language, input } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required'
      });
    }

    const result = await judge0Fallback.executeCode(code, language, input || '');
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error testing code execution:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
