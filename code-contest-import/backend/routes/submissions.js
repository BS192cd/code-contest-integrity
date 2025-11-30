const express = require('express');
const router = express.Router();

const submissionController = require('../controllers/submissionController');
const submissionViewController = require('../controllers/submissionViewController');
const { authenticate, requireTeacher, optionalAuth } = require('../middleware/auth');
const { validate, submissionSchemas, querySchemas } = require('../middleware/validation');
const { loggers } = require('../middleware/activityLogger');

// Execute code with custom input (run endpoint) - allow without auth for testing
router.post('/run', 
  loggers.custom('code_executed'),
  submissionController.runCode
);

// All other submission routes require authentication
router.use(authenticate);

// Submit solution (with enhanced test case validation)
router.post('/', 
  loggers.submitCode,
  validate(submissionSchemas.create), 
  submissionController.submitSolution
);

// Enhanced submission endpoints (temporarily disabled)
// router.get('/problem/:problemId/user', enhancedSubmissionController.getUserSubmissions);
// router.get('/admin/all', requireTeacher, enhancedSubmissionController.getAllSubmissions);

// Get submissions (enhanced with filtering and real-time updates)
router.get('/', 
  validate(querySchemas.pagination, 'query'), 
  submissionViewController.getSubmissionsEnhanced
);

// Get specific submission details
router.get('/:id', 
  loggers.custom('submission_viewed'),
  submissionViewController.getSubmissionDetails
);

// Get user submission statistics
router.get('/stats/:userId?', 
  submissionViewController.getUserSubmissionStats
);

// Get contest submission feed (real-time)
router.get('/contest/:contestId/feed', 
  submissionViewController.getContestSubmissionFeed
);

// Rerun submission (teachers/admin only)  
router.post('/:id/rerun', 
  requireTeacher,
  loggers.custom('submission_rerun'),
  submissionController.rerunSubmission
);

// Legacy route for backward compatibility
router.get('/legacy/list', 
  validate(querySchemas.pagination, 'query'), 
  submissionController.getSubmissions
);

module.exports = router;