const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_registered',
      'user_login',
      'user_logout',
      'contest_created',
      'contest_updated',
      'contest_deleted',
      'contest_joined',
      'contest_left',
      'problem_created',
      'problem_updated',
      'problem_deleted',
      'submission_created',
      'submission_processed',
      'plagiarism_detected',
      'plagiarism_cleared',
      'test_case_added',
      'test_case_updated',
      'leaderboard_updated',
      'bulk_import_started',
      'bulk_import_completed'
    ]
  },
  entityType: {
    type: String,
    enum: ['user', 'contest', 'problem', 'submission', 'test_case', 'system'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Some actions might not have a specific entity
  },
  details: {
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
      default: null
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      default: null
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    sessionId: {
      type: String,
      default: null
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  isPublic: {
    type: Boolean,
    default: false // Whether this activity should be shown in public feeds
  },
  relatedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // Users who should be notified about this activity
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ 'details.contestId': 1, timestamp: -1 });
activityLogSchema.index({ 'details.problemId': 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ isPublic: 1, timestamp: -1 });

// Static method to log activity
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const activity = new this(data);
    await activity.save();
    
    // Emit real-time update if needed
    if (global.io && data.isPublic) {
      global.io.emit('activity_update', {
        activity: await activity.populate('userId', 'username fullName')
      });
    }
    
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

// Static method to get activity feed
activityLogSchema.statics.getActivityFeed = async function(options = {}) {
  const {
    userId,
    contestId,
    problemId,
    actions,
    limit = 50,
    skip = 0,
    publicOnly = false
  } = options;

  const query = {};
  
  if (userId) query.userId = userId;
  if (contestId) query['details.contestId'] = contestId;
  if (problemId) query['details.problemId'] = problemId;
  if (actions && actions.length > 0) query.action = { $in: actions };
  if (publicOnly) query.isPublic = true;

  return this.find(query)
    .populate('userId', 'username fullName avatar')
    .populate('details.contestId', 'title')
    .populate('details.problemId', 'title')
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to get activity statistics
activityLogSchema.statics.getActivityStats = async function(timeframe = '24h') {
  const now = new Date();
  let startTime;

  switch (timeframe) {
    case '1h':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    { $match: { timestamp: { $gte: startTime } } },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Method to format activity for display
activityLogSchema.methods.getDisplayMessage = function() {
  const actionMessages = {
    'user_registered': 'registered on the platform',
    'user_login': 'logged in',
    'contest_created': 'created a new contest',
    'contest_joined': 'joined a contest',
    'problem_created': 'created a new problem',
    'submission_created': 'submitted a solution',
    'submission_processed': 'solution was processed',
    'plagiarism_detected': 'plagiarism was detected in submission'
  };

  return actionMessages[this.action] || 'performed an action';
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);