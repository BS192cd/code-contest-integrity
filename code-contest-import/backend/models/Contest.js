const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'ended', 'cancelled'],
    default: 'upcoming'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    required: true
  },
  maxParticipants: {
    type: Number,
    default: 1000
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  registrationRequired: {
    type: Boolean,
    default: true
  },
  problems: [{
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true
    },
    points: {
      type: Number,
      default: 100
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: null
    },
    submissions: [{
      problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
      },
      submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
      },
      score: {
        type: Number,
        default: 0
      },
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  rules: {
    allowedLanguages: [{
      type: String,
      enum: ['python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust']
    }],
    maxSubmissions: {
      type: Number,
      default: -1 // -1 means unlimited
    },
    penalty: {
      enabled: {
        type: Boolean,
        default: false
      },
      points: {
        type: Number,
        default: 10
      }
    },
    plagiarismDetection: {
      enabled: {
        type: Boolean,
        default: true
      },
      threshold: {
        type: Number,
        default: 70
      }
    }
  },
  prize: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  statistics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ createdBy: 1 });
contestSchema.index({ isPublic: 1 });

// Virtual for contest duration in human readable format
contestSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Method to check if contest is active
contestSchema.methods.isActive = function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime;
};

// Method to get contest status
contestSchema.methods.getStatus = function() {
  const now = new Date();
  if (now < this.startTime) return 'upcoming';
  if (now > this.endTime) return 'ended';
  return 'active';
};

// Method to add participant
contestSchema.methods.addParticipant = function(userId) {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!existingParticipant) {
    this.participants.push({ user: userId });
    this.statistics.totalParticipants += 1;
  }
  return this.save();
};

// Update contest status based on time
contestSchema.pre('save', function(next) {
  this.status = this.getStatus();
  next();
});

module.exports = mongoose.model('Contest', contestSchema);