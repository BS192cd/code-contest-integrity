const express = require('express');
const router = express.Router();

const problemController = require('../controllers/problemController');
const { authenticate, requireTeacher, optionalAuth } = require('../middleware/auth');
const { validate, problemSchemas, querySchemas } = require('../middleware/validation');

// Public/Optional auth routes
router.get('/', optionalAuth, validate(querySchemas.pagination, 'query'), problemController.getProblems);
router.get('/:id', optionalAuth, problemController.getProblem);
router.get('/:id/stats', optionalAuth, problemController.getProblemStats);

// Teacher/Admin routes
router.post('/', authenticate, requireTeacher, validate(problemSchemas.create), problemController.createProblem);
router.put('/:id', authenticate, requireTeacher, validate(problemSchemas.update), problemController.updateProblem);
router.delete('/:id', authenticate, requireTeacher, problemController.deleteProblem);

// Test case management (teachers only)
router.post('/:id/test-cases', authenticate, requireTeacher, validate(problemSchemas.addTestCase), problemController.addTestCase);
router.put('/:id/test-cases/:testCaseId', authenticate, requireTeacher, problemController.updateTestCase);
router.delete('/:id/test-cases/:testCaseId', authenticate, requireTeacher, problemController.deleteTestCase);

module.exports = router;