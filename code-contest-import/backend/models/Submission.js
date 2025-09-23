const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  contestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
    default: null
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compile_error', 'system_error'],
    default: 'pending'
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  executionTime: {
    type: Number, // in milliseconds
    default: null
  },
  memoryUsage: {
    type: Number, // in MB
    default: null
  },
  testResults: [{
    testCase: {
      type: mongoose.Schema.Types.ObjectId
    },
    testCaseIndex: {
      type: Number
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'tle', 'mle', 'runtime_error', 'compile_error']
    },
    executionTime: {
      type: Number // in milliseconds
    },
    memoryUsage: {
      type: Number // in KB
    },
    input: {
      type: String
    },
    expectedOutput: {
      type: String
    },
    actualOutput: {
      type: String
    },
    errorMessage: {
      type: String,
      default: null
    },
    compileOutput: {
      type: String,
      default: null
    },
    judge0Token: {
      type: String,
      default: null
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  judge0Token: {
    type: String,
    default: null
  },
  plagiarismCheck: {
    checked: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    similarSubmissions: [{
      submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
      },
      similarity: {
        type: Number
      },
      details: {
        type: String
      },
      matchedLines: [{
        line1: Number,
        line2: Number,
        content: String
      }]
    }],
    checkedAt: {
      type: Date,
      default: null
    },
    jplagToken: {
      type: String,
      default: null
    },
    analysisDetails: {
      structuralSimilarity: Number,
      variableNameSimilarity: Number,
      logicSimilarity: Number,
      commentSimilarity: Number
    },
    flagged: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewStatus: {
      type: String,
      enum: ['pending', 'cleared', 'confirmed'],
      default: 'pending'
    }
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  codeHash: {
    type: String,
    default: null // Hash of the code for quick similarity checks
  },
  codeLength: {
    type: Number,
    default: 0
  },
  linesOfCode: {
    type: Number,
    default: 0
  },
  processingStartedAt: {
    type: Date,
    default: null
  },
  processingCompletedAt: {
    type: Date,
    default: null
  },
  queuePosition: {
    type: Number,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0
  },
  lastError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
submissionSchema.index({ userId: 1 });
submissionSchema.index({ problemId: 1 });
submissionSchema.index({ contestId: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ contestId: 1, userId: 1, problemId: 1 });

// Virtual for getting passed test cases count
submissionSchema.virtual('passedTestCases').get(function() {
  return this.testResults.filter(tr => tr.status === 'passed').length;
});

// Virtual for getting total test cases count
submissionSchema.virtual('totalTestCases').get(function() {
  return this.testResults.length;
});

// Method to calculate score based on test results
submissionSchema.methods.calculateScore = function() {
  if (this.testResults.length === 0) return 0;
  const passedCount = this.passedTestCases;
  return Math.round((passedCount / this.totalTestCases) * 100);
};

// Method to update submission status
submissionSchema.methods.updateStatus = function() {
  if (this.testResults.length === 0) {
    this.status = 'pending';
    return;
  }

  const hasRuntimeError = this.testResults.some(tr => tr.status === 'runtime_error');
  const hasTLE = this.testResults.some(tr => tr.status === 'tle');
  const hasMLE = this.testResults.some(tr => tr.status === 'mle');
  const allPassed = this.testResults.every(tr => tr.status === 'passed');

  if (hasRuntimeError) {
    this.status = 'runtime_error';
  } else if (hasTLE) {
    this.status = 'time_limit_exceeded';
  } else if (hasMLE) {
    this.status = 'memory_limit_exceeded';
  } else if (allPassed) {
    this.status = 'accepted';
  } else {
    this.status = 'wrong_answer';
  }

  this.score = this.calculateScore();
};

module.exports = mongoose.model('Submission', submissionSchema);