const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { authenticate, requireTeacher } = require('../middleware/auth');
const { validate, querySchemas } = require('../middleware/validation');

// User analytics (students can view their own, teachers can view any)
router.get('/users/:userId?', authenticate, analyticsController.getUserAnalytics);

// Contest analytics (participants and teachers can view)
router.get('/contests/:contestId', authenticate, analyticsController.getContestAnalytics);

// Platform analytics (teachers/admin only)
router.get('/platform', authenticate, requireTeacher, validate(querySchemas.analyticsDate, 'query'), analyticsController.getPlatformAnalytics);

// Generate reports (teachers/admin only)
router.post('/reports', authenticate, requireTeacher, analyticsController.generateReport);

module.exports = router;