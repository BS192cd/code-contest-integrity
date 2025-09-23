const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, userSchemas } = require('../middleware/validation');

// Public routes (no authentication required)
router.post('/register', validate(userSchemas.register), authController.register);
router.post('/login', validate(userSchemas.login), authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (authentication required)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(userSchemas.updateProfile), authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth endpoint is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;