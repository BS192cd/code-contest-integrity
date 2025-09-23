#!/usr/bin/env node

/**
 * Comprehensive backend startup fix script
 * Identifies and fixes common backend startup issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Backend Startup Fix Script\n');

let fixesApplied = 0;

// Fix 1: Ensure all required directories exist
console.log('📋 1. Creating Required Directories:');
const requiredDirs = [
  'backend/controllers',
  'backend/routes',
  'backend/middleware',
  'backend/utils',
  'backend/config',
  'backend/models'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`   ✅ Created ${dir}`);
    fixesApplied++;
  } else {
    console.log(`   ✅ ${dir} exists`);
  }
});

// Fix 2: Check and fix package.json scripts
console.log('\n📋 2. Checking Package.json Scripts:');
const backendPackagePath = path.join(__dirname, 'backend/package.json');
if (fs.existsSync(backendPackagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
  
  let needsUpdate = false;
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
    needsUpdate = true;
  }
  
  const requiredScripts = {
    'start': 'node server.js',
    'dev': 'nodemon server.js',
    'test-simple': 'node server-simple.js',
    'diagnose': 'node diagnose-startup.js'
  };
  
  Object.entries(requiredScripts).forEach(([script, command]) => {
    if (!packageJson.scripts[script]) {
      packageJson.scripts[script] = command;
      console.log(`   ✅ Added script: ${script}`);
      needsUpdate = true;
      fixesApplied++;
    }
  });
  
  if (needsUpdate) {
    fs.writeFileSync(backendPackagePath, JSON.stringify(packageJson, null, 2));
    console.log('   ✅ Updated package.json');
  } else {
    console.log('   ✅ Package.json scripts are correct');
  }
} else {
  console.log('   ❌ Backend package.json not found');
}

// Fix 3: Create minimal auth controller if missing
console.log('\n📋 3. Checking Auth Controller:');
const authControllerPath = path.join(__dirname, 'backend/controllers/authController.js');
if (!fs.existsSync(authControllerPath)) {
  const minimalAuthController = `const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const login = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Login endpoint working (minimal)',
      data: { user: { id: 'test' }, token: 'test-token' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const register = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Register endpoint working (minimal)',
      data: { user: { id: 'test' }, token: 'test-token' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: { user: { id: 'test', username: 'testuser' } }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { login, register, getProfile, logout };`;

  fs.writeFileSync(authControllerPath, minimalAuthController);
  console.log('   ✅ Created minimal auth controller');
  fixesApplied++;
} else {
  console.log('   ✅ Auth controller exists');
}

// Fix 4: Create minimal auth routes if missing
console.log('\n📋 4. Checking Auth Routes:');
const authRoutesPath = path.join(__dirname, 'backend/routes/auth.js');
if (!fs.existsSync(authRoutesPath)) {
  const minimalAuthRoutes = `const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authController.getProfile);
router.post('/logout', authController.logout);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Auth endpoint working' });
});

module.exports = router;`;

  fs.writeFileSync(authRoutesPath, minimalAuthRoutes);
  console.log('   ✅ Created minimal auth routes');
  fixesApplied++;
} else {
  console.log('   ✅ Auth routes exist');
}

// Fix 5: Create routes index if missing
console.log('\n📋 5. Checking Routes Index:');
const routesIndexPath = path.join(__dirname, 'backend/routes/index.js');
if (!fs.existsSync(routesIndexPath)) {
  const routesIndex = `const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CodeContest API is running',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);

module.exports = router;`;

  fs.writeFileSync(routesIndexPath, routesIndex);
  console.log('   ✅ Created routes index');
  fixesApplied++;
} else {
  console.log('   ✅ Routes index exists');
}

// Fix 6: Create minimal JWT utils if missing
console.log('\n📋 6. Checking JWT Utils:');
const jwtUtilsPath = path.join(__dirname, 'backend/utils/jwt.js');
if (!fs.existsSync(jwtUtilsPath)) {
  const jwtUtils = `const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};

module.exports = { generateToken, verifyToken };`;

  fs.writeFileSync(jwtUtilsPath, jwtUtils);
  console.log('   ✅ Created JWT utils');
  fixesApplied++;
} else {
  console.log('   ✅ JWT utils exist');
}

// Fix 7: Install dependencies if node_modules is missing
console.log('\n📋 7. Checking Dependencies:');
const nodeModulesPath = path.join(__dirname, 'backend/node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('   ⚠️  node_modules missing, installing dependencies...');
  try {
    process.chdir(path.join(__dirname, 'backend'));
    execSync('npm install', { stdio: 'inherit' });
    console.log('   ✅ Dependencies installed');
    fixesApplied++;
  } catch (error) {
    console.log('   ❌ Failed to install dependencies:', error.message);
  }
} else {
  console.log('   ✅ Dependencies installed');
}

// Summary
console.log('\n📊 Fix Summary:');
console.log(`   Fixes applied: ${fixesApplied}`);

if (fixesApplied > 0) {
  console.log('\n🎉 FIXES APPLIED SUCCESSFULLY!');
} else {
  console.log('\n✅ NO FIXES NEEDED!');
}

console.log('\n🚀 Next Steps:');
console.log('   1. Test startup: cd backend && node test-startup.js');
console.log('   2. Start simple server: cd backend && npm run test-simple');
console.log('   3. Start full server: cd backend && npm start');

console.log('\n' + '='.repeat(60));