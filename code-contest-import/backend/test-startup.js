#!/usr/bin/env node

/**
 * Simple backend startup test
 * Tests if the server can start without crashing
 */

console.log('🧪 Testing Backend Startup...\n');

// Test 1: Check if we can require the main modules
console.log('📋 1. Testing Module Imports:');

try {
  console.log('   Testing express...');
  const express = require('express');
  console.log('   ✅ Express imported successfully');
  
  console.log('   Testing dotenv...');
  require('dotenv').config();
  console.log('   ✅ Dotenv loaded successfully');
  
  console.log('   Testing mongoose...');
  const mongoose = require('mongoose');
  console.log('   ✅ Mongoose imported successfully');
  
  console.log('   Testing auth controller...');
  const authController = require('./controllers/authController');
  console.log('   ✅ Auth controller imported successfully');
  console.log(`   Available methods: ${Object.keys(authController).join(', ')}`);
  
  console.log('   Testing auth routes...');
  const authRoutes = require('./routes/auth');
  console.log('   ✅ Auth routes imported successfully');
  
  console.log('   Testing JWT utils...');
  const jwtUtils = require('./utils/jwt');
  console.log('   ✅ JWT utils imported successfully');
  console.log(`   Available functions: ${Object.keys(jwtUtils).join(', ')}`);
  
} catch (error) {
  console.log('   ❌ Module import failed:', error.message);
  process.exit(1);
}

// Test 2: Check environment variables
console.log('\n📋 2. Testing Environment Variables:');

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT'];
let envOk = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} is set`);
  } else {
    console.log(`   ❌ ${envVar} is missing`);
    envOk = false;
  }
});

if (!envOk) {
  console.log('\n❌ Environment variables missing. Check your .env file.');
  process.exit(1);
}

// Test 3: Test JWT functionality
console.log('\n📋 3. Testing JWT Functionality:');

try {
  const { generateToken, verifyToken } = require('./utils/jwt');
  
  const testPayload = { id: 'test123', username: 'testuser', role: 'student' };
  const token = generateToken(testPayload, '1h');
  console.log('   ✅ Token generation successful');
  
  const decoded = verifyToken(token);
  console.log('   ✅ Token verification successful');
  console.log(`   Decoded payload: ${JSON.stringify(decoded)}`);
  
} catch (error) {
  console.log('   ❌ JWT test failed:', error.message);
  process.exit(1);
}

// Test 4: Test basic server creation (without starting)
console.log('\n📋 4. Testing Server Creation:');

try {
  const express = require('express');
  const app = express();
  
  // Add basic middleware
  app.use(express.json());
  
  // Add a test route
  app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Test endpoint working' });
  });
  
  console.log('   ✅ Express app created successfully');
  console.log('   ✅ Basic middleware added');
  console.log('   ✅ Test route added');
  
} catch (error) {
  console.log('   ❌ Server creation failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 ALL STARTUP TESTS PASSED!');
console.log('✅ Backend should start successfully');
console.log('\n🚀 Ready to start the server with: npm start');
console.log('\n' + '='.repeat(50));