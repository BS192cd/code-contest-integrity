const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    maxlength: [100, 'Class name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
    index: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  contests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
ClassSchema.index({ teacher: 1, createdAt: -1 });
ClassSchema.index({ students: 1 });

// Virtual for student count
ClassSchema.virtual('studentCount').get(function() {
  return this.students ? this.students.length : 0;
});

// Virtual for contest count
ClassSchema.virtual('contestCount').get(function() {
  return this.contests ? this.contests.length : 0;
});

// Ensure virtuals are included in JSON
ClassSchema.set('toJSON', { virtuals: true });
ClassSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update updatedAt
ClassSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Class', ClassSchema);
