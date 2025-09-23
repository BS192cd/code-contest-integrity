#!/usr/bin/env node

/**
 * Backend startup diagnostic script
 * Checks for common issues that prevent server startup
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Backend Startup Diagnostic\n');

let allGood = true;
const issues = [];

// Check 1: Environment file
console.log('📋 1. Environment Configuration:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasMongoUri = envContent.includes('MONGO_URI=') && !envContent.includes('MONGO_URI=');
  const hasJwtSecret = envContent.includes('JWT_SECRET=') && envContent.split('JWT_SECRET=')[1].split('\n')[0].trim().length > 10;
  const hasPort = envContent.includes('PORT=3001');
  
  console.log(`   ✅ .env file exists`);
  console.log(`   ${hasMongoUri ? '✅' : '❌'} MONGO_URI configured`);
  console.log(`   ${hasJwtSecret ? '✅' : '❌'} JWT_SECRET configured (${hasJwtSecret ? 'valid length' : 'missing or too short'})`);
  console.log(`   ${hasPort ? '✅' : '❌'} PORT configured`);
  
  if (!hasMongoUri || !hasJwtSecret || !hasPort) {
    issues.push('Environment configuration incomplete');
    allGood = false;
  }
} else {
  console.log('   ❌ .env file missing');
  issues.push('.env file missing');
  allGood = false;
}

// Check 2: Required files
console.log('\n📋 2. Required Files:');
const requiredFiles = [
  'server.js',
  'config/database.js',
  'controllers/authController.js',
  'routes/auth.js',
  'routes/index.js',
  'middleware/auth.js',
  'middleware/validation.js',
  'utils/jwt.js',
  'models/User.js'
];

let missingFiles = 0;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    issues.push(`${file} missing`);
    missingFiles++;
    allGood = false;
  }
});

// Check 3: Controller exports
console.log('\n📋 3. Controller Exports:');
const authControllerPath = path.join(__dirname, 'controllers/authController.js');
if (fs.existsSync(authControllerPath)) {
  const authContent = fs.readFileSync(authControllerPath, 'utf8');
  
  const requiredMethods = ['login', 'register', 'getProfile', 'logout'];
  const exportedMethods = [];
  
  requiredMethods.forEach(method => {
    if (authContent.includes(`const ${method} =`) && authContent.includes(`${method}`)) {
      exportedMethods.push(method);
      console.log(`   ✅ ${method} method exists`);
    } else {
      console.log(`   ❌ ${method} method missing`);
      issues.push(`${method} method missing in authController`);
      allGood = false;
    }
  });
  
  // Check module.exports
  if (authContent.includes('module.exports')) {
    console.log(`   ✅ module.exports found`);
  } else {
    console.log(`   ❌ module.exports missing`);
    issues.push('authController missing module.exports');
    allGood = false;
  }
} else {
  console.log('   ❌ authController.js not found');
}

// Check 4: Dependencies
console.log('\n📋 4. Dependencies:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('   ✅ package.json exists');
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules exists');
  } else {
    console.log('   ❌ node_modules missing - run npm install');
    issues.push('Dependencies not installed');
    allGood = false;
  }
} else {
  console.log('   ❌ package.json missing');
  issues.push('package.json missing');
  allGood = false;
}

// Check 5: Route configuration
console.log('\n📋 5. Route Configuration:');
const routesIndexPath = path.join(__dirname, 'routes/index.js');
if (fs.existsSync(routesIndexPath)) {
  const routesContent = fs.readFileSync(routesIndexPath, 'utf8');
  
  if (routesContent.includes("require('./auth')")) {
    console.log('   ✅ Auth routes imported');
  } else {
    console.log('   ❌ Auth routes not imported');
    issues.push('Auth routes not imported in routes/index.js');
    allGood = false;
  }
  
  if (routesContent.includes("router.use('/auth'")) {
    console.log('   ✅ Auth routes mounted');
  } else {
    console.log('   ❌ Auth routes not mounted');
    issues.push('Auth routes not mounted');
    allGood = false;
  }
} else {
  console.log('   ❌ routes/index.js missing');
}

// Summary
console.log('\n📊 Diagnostic Summary:');
console.log(`   Missing files: ${missingFiles}/${requiredFiles.length}`);
console.log(`   Issues found: ${issues.length}`);

if (allGood) {
  console.log('\n🎉 ALL CHECKS PASSED!');
  console.log('✅ Backend should start successfully');
  console.log('\n🚀 To start the backend:');
  console.log('   cd backend');
  console.log('   npm start');
} else {
  console.log('\n⚠️  ISSUES FOUND:');
  issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log('\n🔧 Fix these issues before starting the backend.');
}

console.log('\n' + '='.repeat(60));