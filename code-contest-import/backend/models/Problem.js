const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 10
  },
  explanation: {
    type: String,
    default: ''
  },
  timeLimit: {
    type: Number,
    default: 2 // seconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // MB
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  statement: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  constraints: {
    type: String,
    trim: true
  },
  inputFormat: {
    type: String,
    trim: true
  },
  outputFormat: {
    type: String,
    trim: true
  },
  examples: [{
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      default: ''
    }
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['Algorithm', 'Data Structure', 'Mathematics', 'String Processing', 'Graph Theory', 'Dynamic Programming', 'Other'],
    default: 'Algorithm'
  },
  timeLimit: {
    type: Number, // in seconds
    default: 2
  },
  memoryLimit: {
    type: Number, // in MB
    default: 128
  },
  testCases: [testCaseSchema],
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  statistics: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    acceptedSubmissions: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  },
  hints: [{
    level: {
      type: Number,
      min: 1,
      max: 3
    },
    content: {
      type: String,
      required: true
    }
  }],
  editorialUrl: {
    type: String,
    default: null
  },
  solutionTemplate: {
    python: {
      type: String,
      default: ''
    },
    javascript: {
      type: String,
      default: ''
    },
    java: {
      type: String,
      default: ''
    },
    cpp: {
      type: String,
      default: ''
    },
    c: {
      type: String,
      default: ''
    }
  },
  source: {
    type: String,
    default: 'Original' // Attribution for problem source
  },
  sourceUrl: {
    type: String,
    default: null
  },
  author: {
    type: String,
    default: null
  },
  companies: [{
    type: String // Companies that have asked this problem
  }],
  relatedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  algorithmTags: [{
    type: String // More specific algorithm tags
  }],
  dataStructureTags: [{
    type: String // Specific data structure tags
  }],
  complexityAnalysis: {
    timeComplexity: {
      type: String,
      default: null // e.g., "O(n log n)"
    },
    spaceComplexity: {
      type: String,
      default: null // e.g., "O(n)"
    }
  },
  followUpQuestions: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false // Whether the problem has been verified by admin
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ isPublic: 1, isActive: 1 });

// Virtual for getting public test cases only
problemSchema.virtual('publicTestCases').get(function() {
  return this.testCases.filter(tc => tc.isPublic);
});

// Method to calculate acceptance rate
problemSchema.methods.calculateAcceptanceRate = function() {
  if (this.statistics.totalSubmissions === 0) return 0;
  return (this.statistics.acceptedSubmissions / this.statistics.totalSubmissions) * 100;
};

// Method to add submission
problemSchema.methods.addSubmission = function(submissionId, isAccepted = false) {
  this.submissions.push(submissionId);
  this.statistics.totalSubmissions += 1;
  if (isAccepted) {
    this.statistics.acceptedSubmissions += 1;
  }
  this.statistics.acceptanceRate = this.calculateAcceptanceRate();
  return this.save();
};

// Method to get problem for contest (excludes some sensitive data)
problemSchema.methods.getContestVersion = function() {
  const problemObject = this.toObject();
  // Hide non-public test cases
  problemObject.testCases = this.publicTestCases;
  return problemObject;
};

module.exports = mongoose.model('Problem', problemSchema);