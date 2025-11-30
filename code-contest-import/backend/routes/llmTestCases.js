/**
 * Routes for LLM-powered test case operations
 */

const express = require('express');
const router = express.Router();
const llmTestCaseController = require('../controllers/llmTestCaseController');
const { authenticate, requireTeacher } = require('../middleware/auth');

// All routes require authentication and teacher role
router.use(authenticate);
router.use(requireTeacher);

// Generate test cases using LLM
router.post('/generate-test-cases', llmTestCaseController.generateTestCases);

// Validate test cases using LLM
router.post('/validate-test-cases', llmTestCaseController.validateTestCases);

// Generate reference solution using LLM
router.post('/generate-solution', llmTestCaseController.generateSolution);

// Auto-fix test cases using reference solution
router.post('/auto-fix-test-cases', llmTestCaseController.autoFixTestCases);

// Complete workflow: generate, validate, and save
router.post('/complete-workflow', llmTestCaseController.completeWorkflow);

module.exports = router;
