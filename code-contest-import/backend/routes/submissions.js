const express = require('express');
const router = express.Router();

const submissionController = require('../controllers/submissionController');
const submissionViewController = require('../controllers/submissionViewController');
const { authenticate, requireTeacher } = require('../middleware/auth');
const { validate, submissionSchemas, querySchemas } = require('../middleware/validation');
const { loggers } = require('../middleware/activityLogger');

// All submission routes require authentication
router.use(authenticate);

// Submit solution (with activity logging)
router.post('/', 
  loggers.submitCode,
  validate(submissionSchemas.create), 
  submissionController.submitSolution
);

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

// Execute code with custom input (run endpoint)
router.post('/run', 
  loggers.custom('code_executed'),
  submissionController.runCode
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