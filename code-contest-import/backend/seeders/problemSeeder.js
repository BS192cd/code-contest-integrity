const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
    trim: true
  },
  expectedOutput: {
    type: String,
    required: true,
    default: " "
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
    default: 2
  },
  memoryLimit: {
    type: Number,
    default: 128
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
    // REMOVED: minlength validation to allow short titles
  },
  statement: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  constraints: {
    type: String,
    trim: true,
    default: ''
  },
  inputFormat: {
    type: String,
    trim: true,
    default: ''
  },
  outputFormat: {
    type: String,
    trim: true,
    default: ''
  },
  examples: [{
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true,
      default: " "
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
    type: Number,
    default: 2
  },
  memoryLimit: {
    type: Number,
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
    default: 'Original'
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
    type: String
  }],
  relatedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  algorithmTags: [{
    type: String
  }],
  dataStructureTags: [{
    type: String
  }],
  complexityAnalysis: {
    timeComplexity: {
      type: String,
      default: null
    },
    spaceComplexity: {
      type: String,
      default: null
    }
  },
  followUpQuestions: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    default: false
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

// Indexes
problemSchema.index({ difficulty: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ createdBy: 1 });
problemSchema.index({ isPublic: 1, isActive: 1 });

// Virtual for getting public test cases only
problemSchema.virtual('publicTestCases').get(function() {
  return this.testCases.filter(tc => tc.isPublic);
});

// Pre-save middleware to handle empty strings
problemSchema.pre('save', function(next) {
  // Ensure expectedOutput is never empty
  if (this.testCases && Array.isArray(this.testCases)) {
    this.testCases = this.testCases.map(tc => ({
      ...tc,
      expectedOutput: tc.expectedOutput === null || tc.expectedOutput === undefined || tc.expectedOutput === "" ? " " : tc.expectedOutput
    }));
  }
  
  // Handle examples
  if (this.examples && Array.isArray(this.examples)) {
    this.examples = this.examples.map(example => ({
      ...example,
      output: example.output === null || example.output === undefined || example.output === "" ? " " : example.output
    }));
  }
  
  next();
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

// Method to get problem for contest
problemSchema.methods.getContestVersion = function() {
  const problemObject = this.toObject();
  problemObject.testCases = this.publicTestCases;
  delete problemObject.solutionTemplate;
  delete problemObject.editorialUrl;
  delete problemObject.hints;
  return problemObject;
};

module.exports = mongoose.model('Problem', problemSchema);