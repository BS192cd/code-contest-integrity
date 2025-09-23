const User = require('../models/User');
const { generateToken, generateTokens, verifyToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'student' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      passwordHash: password, // Will be hashed by pre-save middleware
      fullName,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    console.log('Received login attempt:', { login, password });

    // Accept multiple test credentials for development
    const validCredentials = [
      { login: 'test@example.com', password: 'password', user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'student' } },
      { login: 'test', password: 'password', user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'student' } },
      { login: 'admin', password: 'admin', user: { id: '2', email: 'admin@example.com', name: 'Admin User', role: 'admin' } },
      { login: 'demo', password: 'demo', user: { id: '3', email: 'demo@example.com', name: 'Demo User', role: 'student' } }
    ];

    const validCredential = validCredentials.find(cred => 
      cred.login === login && cred.password === password
    );

    if (validCredential) {
      const token = jwt.sign(
        { id: validCredential.user.id, email: validCredential.user.email, role: validCredential.user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        data: {
          user: validCredential.user,
          token
        },
        message: 'Login successful'
      });
    }

    // If no valid test credentials, try database lookup
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { username: login }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Database user found and password valid
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.email;
    delete updates.username;
    delete updates.passwordHash;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      data: tokens,
      message: 'Tokens refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

// Logout user (client-side token removal)
const logout = async (req, res) => {
  try {
    // Since we're using stateless JWT, logout is handled client-side
    // This endpoint is mainly for logging purposes
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout
};