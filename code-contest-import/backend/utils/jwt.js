const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate access and refresh tokens
const generateTokens = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  const accessToken = generateToken(payload, '15m'); // Short-lived access token
  const refreshToken = generateToken({ id: user._id }, '7d'); // Long-lived refresh token

  return { accessToken, refreshToken };
};

module.exports = {
  generateToken,
  verifyToken,
  generateTokens
};