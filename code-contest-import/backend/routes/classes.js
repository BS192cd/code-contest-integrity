const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const classController = require('../controllers/classController');

// All routes require authentication
router.use(authenticate);

// All routes require teacher or admin role
router.use(authorize('teacher', 'admin'));

// Get all classes for the authenticated teacher
router.get('/', classController.getClasses);

// Get single class by ID
router.get('/:id', classController.getClass);

// Create new class
router.post('/', classController.createClass);

// Update class
router.put('/:id', classController.updateClass);

// Delete class
router.delete('/:id', classController.deleteClass);

// Add students to class
router.post('/:id/students', classController.addStudents);

// Remove student from class
router.delete('/:id/students/:studentId', classController.removeStudent);

// Assign contests to class
router.post('/:id/contests', classController.assignContests);

// Remove contest from class
router.delete('/:id/contests/:contestId', classController.removeContest);

module.exports = router;
