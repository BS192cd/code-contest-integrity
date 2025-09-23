require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Create Express app
const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB (with error handling)
connectDB().catch(err => {
  console.warn('MongoDB connection failed, continuing without database:', err.message);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CodeContest API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth endpoints (simplified)
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  res.json({
    success: true,
    message: 'Login endpoint working',
    data: {
      user: { id: 'test', username: 'testuser', role: 'student' },
      token: 'test-token'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register attempt:', req.body);
  res.json({
    success: true,
    message: 'Register endpoint working',
    data: {
      user: { id: 'test', username: req.body.username, role: req.body.role || 'student' },
      token: 'test-token'
    }
  });
});

app.get('/api/auth/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Catch all for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth health: http://localhost:${PORT}/api/auth/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;