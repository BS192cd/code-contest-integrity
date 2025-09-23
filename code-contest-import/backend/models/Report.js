const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['plagiarism', 'analytics', 'contest_summary', 'user_activity', 'system_performance'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedEntities: {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      default: null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      default: null
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  filters: {
    dateRange: {
      startDate: {
        type: Date,
        default: null
      },
      endDate: {
        type: Date,
        default: null
      }
    },
    parameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  format: {
    type: String,
    enum: ['json', 'csv', 'pdf'],
    default: 'json'
  },
  fileUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'completed'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ type: 1 });
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ 'relatedEntities.contest': 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ expiresAt: 1 });

// Method to check if report is expired
reportSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Static method to clean up expired reports
reportSchema.statics.cleanupExpired = function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model('Report', reportSchema);