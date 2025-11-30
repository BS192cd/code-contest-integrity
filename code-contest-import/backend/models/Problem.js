const mongoose = require('mongoose');

const visibleTestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, required: true }
});

const hiddenTestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true }
});


const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
    // NO minlength validation - removed completely
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10 // Reduced from 500 to allow shorter descriptions
  },
  constraints: { type: mongoose.Schema.Types.Mixed },
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
    enum: ['easy', 'medium', 'hard'],
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
  visibleTestCases: [visibleTestCaseSchema],
  hiddenTestCases: [hiddenTestCaseSchema],
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isPublic: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    explanation: { type: String, default: '' },
    points: { type: Number, default: 10 },
    order: { type: Number, default: 0 }
  }],
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
  solutionStub: { type: String },
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
  
  // Universal wrapper metadata (flexible schema)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
    description: 'Universal wrapper configuration for automatic I/O handling'
  },
  
  // Universal wrapper system fields
  executionType: {
    type: String,
    enum: ['function', 'program', 'custom'],
    default: 'function',
    description: 'How the code should be executed'
  },
  
  signature: {
    functionName: {
      type: String,
      description: 'Name of the function to call'
    },
    returnType: {
      type: String,
      description: 'Return type of the function'
    },
    parameters: [{
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      description: String
    }]
  },
  
  problemCategory: {
    type: String,
    enum: ['array', 'string', 'linkedlist', 'tree', 'graph', 'dp', 'math', 'other'],
    default: 'other',
    description: 'Category for template selection'
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
  return this.visibleTestCases;
});

// Pre-save middleware to handle empty strings
problemSchema.pre('save', function(next) {
  // Ensure expectedOutput is never empty
  if (this.visibleTestCases && Array.isArray(this.visibleTestCases)) {
    this.visibleTestCases = this.visibleTestCases.map(tc => ({
      ...tc,
      output: tc.output === null || tc.output === undefined || tc.output === "" ? " " : tc.output
    }));
  }
  if (this.hiddenTestCases && Array.isArray(this.hiddenTestCases)) {
    this.hiddenTestCases = this.hiddenTestCases.map(tc => ({
      ...tc,
      output: tc.output === null || tc.output === undefined || tc.output === "" ? " " : tc.output
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

module.exports = mongoose.models.Problem || mongoose.model('Problem', problemSchema);