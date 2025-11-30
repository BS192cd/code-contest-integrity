const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');

// Get student by ID
router.get('/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await User.findById(studentId).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's submission count
    const submissionCount = await Submission.countDocuments({ userId: studentId });
    
    // Get student's contest participation
    const contestCount = await Submission.distinct('contestId', { userId: studentId }).then(ids => ids.length);

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        stats: {
          submissions: submissionCount,
          contests: contestCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student',
      error: error.message
    });
  }
});

// Get all students (for teachers/admins)
router.get('/', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
});

// Get student's submissions
router.get('/:studentId/submissions', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const submissions = await Submission.find({ userId: studentId })
      .populate('problemId', 'title difficulty')
      .populate('contestId', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

module.exports = router;
