const Class = require('../models/Class');
const User = require('../models/User');

// Get all classes for the authenticated teacher
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('teacher', 'username fullName email')
      .populate('students', 'username fullName email')
      .populate('contests', 'title startTime endTime status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes',
      message: error.message
    });
  }
};

// Get single class by ID
const getClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    const classData = await Class.findById(id)
      .populate('teacher', 'username fullName email')
      .populate('students', 'username fullName email')
      .populate('contests', 'title startTime endTime status');

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
        message: `No class found with ID: ${id}`
      });
    }

    // Check if user is the teacher of this class
    if (req.user.role !== 'admin' && 
        classData.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view this class'
      });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Get class error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch class',
      message: error.message
    });
  }
};

// Create new class
const createClass = async (req, res) => {
  try {
    const { name, description, students, contests } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          name: 'Class name is required'
        }
      });
    }

    // Validate students if provided
    if (students && students.length > 0) {
      const existingStudents = await User.find({
        _id: { $in: students },
        role: 'student'
      });

      if (existingStudents.length !== students.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid students',
          message: 'One or more students not found or not a student role'
        });
      }
    }

    // Create class
    const classData = new Class({
      name,
      description: description || '',
      teacher: req.user._id,
      students: students || [],
      contests: contests || []
    });

    await classData.save();

    // Populate for response
    await classData.populate('teacher', 'username fullName email');
    await classData.populate('students', 'username fullName email');
    await classData.populate('contests', 'title startTime endTime status');

    res.status(201).json({
      success: true,
      data: classData,
      message: 'Class created successfully'
    });
  } catch (error) {
    console.error('Create class error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create class',
      message: error.message
    });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
        message: `No class found with ID: ${id}`
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && 
        classData.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
        message: 'You do not have permission to update this class'
      });
    }

    // Validate students if being updated
    if (updates.students && updates.students.length > 0) {
      const existingStudents = await User.find({
        _id: { $in: updates.students },
        role: 'student'
      });

      if (existingStudents.length !== updates.students.length) {
        return res.status(400).json({
          success: false,
          error: 'Invalid students',
          message: 'One or more students not found or not a student role'
        });
      }
    }

    // Update class
    Object.assign(classData, updates);
    await classData.save();

    // Populate for response
    await classData.populate('teacher', 'username fullName email');
    await classData.populate('students', 'username fullName email');
    await classData.populate('contests', 'title startTime endTime status');

    res.json({
      success: true,
      data: classData,
      message: 'Class updated successfully'
    });
  } catch (error) {
    console.error('Update class error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.keys(error.errors).reduce((acc, key) => {
          acc[key] = error.errors[key].message;
          return acc;
        }, {})
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update class',
      message: error.message
    });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found',
        message: `No class found with ID: ${id}`
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && 
        classData.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
        message: 'You do not have permission to delete this class'
      });
    }

    await Class.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete class',
      message: error.message
    });
  }
};

// Add students to class
const addStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          studentIds: 'Student IDs array is required'
        }
      });
    }

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && 
        classData.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
        message: 'You do not have permission to modify this class'
      });
    }

    // Validate students exist
    const students = await User.find({
      _id: { $in: studentIds },
      role: 'student'
    });

    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid students',
        message: 'One or more students not found or not a student role'
      });
    }

    // Add students (avoid duplicates)
    studentIds.forEach(studentId => {
      if (!classData.students.includes(studentId)) {
        classData.students.push(studentId);
      }
    });

    await classData.save();
    await classData.populate('students', 'username fullName email');

    res.json({
      success: true,
      data: classData,
      message: 'Students added successfully'
    });
  } catch (error) {
    console.error('Add students error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add students',
      message: error.message
    });
  }
};

// Remove student from class
const removeStudent = async (req, res) => {
  try {
    const { id, studentId } = req.params;

    // Validate ObjectId formats
    if (!id.match(/^[0-9a-fA-F]{24}$/) || !studentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && 
        classData.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
        message: 'You do not have permission to modify this class'
      });
    }

    // Remove student
    classData.students = classData.students.filter(
      s => s.toString() !== studentId
    );

    await classData.save();
    await classData.populate('students', 'username fullName email');

    res.json({
      success: true,
      data: classData,
      message: 'Student removed successfully'
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove student',
      message: error.message
    });
  }
};

// Assign contests to class
const assignContests = async (req, res) => {
  try {
    const { id } = req.params;
    const { contestIds } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    if (!contestIds || !Array.isArray(contestIds) || contestIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          contestIds: 'Contest IDs array is required'
        }
      });
    }

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && 
        classData.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
        message: 'You do not have permission to modify this class'
      });
    }

    // Validate contests exist
    const Contest = require('../models/Contest');
    const contests = await Contest.find({
      _id: { $in: contestIds }
    });

    if (contests.length !== contestIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid contests',
        message: 'One or more contests not found'
      });
    }

    // Add contests (avoid duplicates)
    contestIds.forEach(contestId => {
      if (!classData.contests.includes(contestId)) {
        classData.contests.push(contestId);
      }
    });

    await classData.save();
    await classData.populate('contests', 'title startTime endTime status');

    res.json({
      success: true,
      data: classData,
      message: 'Contests assigned successfully'
    });
  } catch (error) {
    console.error('Assign contests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign contests',
      message: error.message
    });
  }
};

// Remove contest from class
const removeContest = async (req, res) => {
  try {
    const { id, contestId } = req.params;

    // Validate ObjectId formats
    if (!id.match(/^[0-9a-fA-F]{24}$/) || !contestId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    const classData = await Class.findById(id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && 
        classData.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
        message: 'You do not have permission to modify this class'
      });
    }

    // Remove contest
    classData.contests = classData.contests.filter(
      c => c.toString() !== contestId
    );

    await classData.save();
    await classData.populate('contests', 'title startTime endTime status');

    res.json({
      success: true,
      data: classData,
      message: 'Contest removed successfully'
    });
  } catch (error) {
    console.error('Remove contest error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove contest',
      message: error.message
    });
  }
};

module.exports = {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  addStudents,
  removeStudent,
  assignContests,
  removeContest
};
