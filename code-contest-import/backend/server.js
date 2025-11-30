const path = require('path');
// Load .env from current backend directory
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
// Optional debug of environment loading without leaking secrets
if (process.env.DEBUG_ENV === 'true') {
  const envPath = path.resolve(__dirname, '.env');
  const hasMongo = Boolean(process.env.MONGO_URI || process.env.MONGODB_URI);
  const maskedJwt = process.env.JWT_SECRET ? `${process.env.JWT_SECRET.slice(0, 4)}***` : 'undefined';
  console.log('[ENV] Loaded .env from:', envPath);
  console.log('[ENV] NODE_ENV:', process.env.NODE_ENV || 'undefined');
  console.log('[ENV] MONGO present:', hasMongo);
  console.log('[ENV] JWT_SECRET (masked):', maskedJwt);
}

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const connectDB = require('./config/database');
const apiRoutes = require('./routes');
const LeaderboardSocket = require('./sockets/leaderboardSocket');

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const leaderboardSocket = new LeaderboardSocket(server);

// Make WebSocket globally accessible for other modules
global.leaderboardSocket = leaderboardSocket;

// Connect to MongoDB
connectDB();

// Middleware - CORS FIRST (Allow all origins in development)
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());

// Rate limiting (skip OPTIONS preflight requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => req.method === 'OPTIONS', // Skip preflight requests
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  }
});

// Apply rate limiting to all requests
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
// Around line 55-65 in server.js - Update the authLimiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 100 attempts in development
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (important for Replit)
app.set('trust proxy', 1);

// Cache-busting middleware - Prevent browser caching of API responses
app.use('/api', (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  next();
});

// API routes
app.use('/api', apiRoutes);

// WebSocket endpoint info
app.get('/websocket', (req, res) => {
  res.json({
    success: true,
    message: 'WebSocket server is running',
    endpoints: [
      'ws://localhost:3001/contest/{contestId}/leaderboard',
      'ws://localhost:3001/contest/{contestId}/submissions',
      'ws://localhost:3001/notifications'
    ],
    events: {
      client_to_server: [
        'join_contest',
        'leave_contest',
        'join_submission_feed',
        'leave_submission_feed'
      ],
      server_to_client: [
        'leaderboard_update',
        'new_submission',
        'contest_update',
        'notification',
        'error'
      ]
    }
  });
});

// Serve uploaded files
app.use('/uploads', express.static(process.env.UPLOAD_PATH || './uploads'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    availableEndpoints: [
      '/api/auth',
      '/api/contests',
      '/api/problems',
      '/api/submissions',
      '/api/leaderboard',
      '/api/analytics',
      '/api/plagiarism',
      '/api/upload'
    ]
  });
});

// Global error handler - Import and use enhanced error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket server running on port ${PORT}`);
  console.log(`📁 File uploads directory: ${process.env.UPLOAD_PATH || './uploads'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for testing or external use
module.exports = { app, server, leaderboardSocket };