const Joi = require('joi');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    req[property] = value;
    next();
  };
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('student', 'teacher').default('student')
  }),

  login: Joi.object({
    login: Joi.string().required(), // can be email or username
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(100),
    preferences: Joi.object({
      preferredLanguage: Joi.string().valid('python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust'),
      notifications: Joi.object({
        email: Joi.boolean(),
        browser: Joi.boolean()
      })
    })
  })
};

// Contest validation schemas
const contestSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    startTime: Joi.date().iso().greater('now').required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard', 'Expert').required(),
    maxParticipants: Joi.number().integer().min(1).max(10000).default(1000),
    isPublic: Joi.boolean().default(true),
    registrationRequired: Joi.boolean().default(true),
    problems: Joi.array().items(
      Joi.object({
        problemId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        points: Joi.number().integer().min(1).max(1000).default(100),
        order: Joi.number().integer().min(0).default(0)
      })
    ).min(1).required(),
    rules: Joi.object({
      allowedLanguages: Joi.array().items(
        Joi.string().valid('python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust')
      ).min(1).required(),
      maxSubmissions: Joi.number().integer().min(-1).default(-1),
      penalty: Joi.object({
        enabled: Joi.boolean().default(false),
        points: Joi.number().integer().min(0).default(10)
      }),
      plagiarismDetection: Joi.object({
        enabled: Joi.boolean().default(true),
        threshold: Joi.number().min(30).max(100).default(70)
      })
    }),
    prize: Joi.string().max(200).allow(null, ''),
    tags: Joi.array().items(Joi.string().min(1).max(50)).max(10)
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(200),
    description: Joi.string().min(10).max(2000),
    startTime: Joi.date().iso(),
    endTime: Joi.date().iso(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard', 'Expert'),
    maxParticipants: Joi.number().integer().min(1).max(10000),
    isPublic: Joi.boolean(),
    registrationRequired: Joi.boolean(),
    prize: Joi.string().max(200).allow(null, ''),
    tags: Joi.array().items(Joi.string().min(1).max(50)).max(10)
  }).min(1)
};

// Problem validation schemas
const problemSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    statement: Joi.string().min(20).required(),
    description: Joi.string(),
    constraints: Joi.string(),
    inputFormat: Joi.string(),
    outputFormat: Joi.string(),
    examples: Joi.array().items(
      Joi.object({
        input: Joi.string().required(),
        output: Joi.string().required(),
        explanation: Joi.string().default('')
      })
    ).min(1).required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard', 'Expert').required(),
    tags: Joi.array().items(Joi.string().min(1).max(50)).max(10),
    category: Joi.string().valid('Algorithm', 'Data Structure', 'Mathematics', 'String Processing', 'Graph Theory', 'Dynamic Programming', 'Other').default('Algorithm'),
    timeLimit: Joi.number().min(0.5).max(10).default(2),
    memoryLimit: Joi.number().integer().min(64).max(512).default(128),
    isPublic: Joi.boolean().default(true)
  }),

  addTestCase: Joi.object({
    input: Joi.string().required(),
    expectedOutput: Joi.string().required(),
    isPublic: Joi.boolean().default(false),
    points: Joi.number().integer().min(1).max(100).default(10)
  })
};

// Submission validation schemas
const submissionSchemas = {
  create: Joi.object({
    code: Joi.string().min(10).max(50000).required(),
    language: Joi.string().valid('python', 'javascript', 'java', 'cpp', 'c', 'go', 'rust').required(),
    problemId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    contestId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null)
  })
};

// Query validation schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('createdAt', '-createdAt', 'title', '-title', 'difficulty', '-difficulty').default('-createdAt')
  }),

  contestFilter: Joi.object({
    status: Joi.string().valid('upcoming', 'active', 'ended', 'all').default('all'),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard', 'Expert', 'all').default('all'),
    search: Joi.string().max(100),
    tags: Joi.string().max(200)
  }),

  analyticsDate: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')),
    period: Joi.string().valid('day', 'week', 'month', 'year').default('month')
  })
};

module.exports = {
  validate,
  userSchemas,
  contestSchemas,
  problemSchemas,
  submissionSchemas,
  querySchemas
};