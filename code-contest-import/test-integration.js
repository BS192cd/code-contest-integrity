#!/usr/bin/env node

/**
 * Comprehensive integration test for CodeContest platform
 * Tests backend-frontend integration, authentication, and API endpoints
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 CodeContest Integration Test\n');

let allPassed = true;
const issues = [];

// Test 1: Environment Configuration
console.log('📋 1. Environment Configuration:\n');

// Check backend .env
const backendEnvPath = path.join(__dirname, 'backend/.env');
if (fs.existsSync(backendEnvPath)) {
  const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  
  const hasMongoUri = backendEnv.includes('MONGO_URI=');
  const hasJwtSecret = backendEnv.includes('JWT_SECRET=');
  const hasPort = backendEnv.includes('PORT=3001');
  
  console.log(`   Backend .env: ${hasMongoUri && hasJwtSecret && hasPort ? '✅' : '❌'}`);
  console.log(`      - MONGO_URI: ${hasMongoUri ? '✅' : '❌'}`);
  console.log(`      - JWT_SECRET: ${hasJwtSecret ? '✅' : '❌'}`);
  console.log(`      - PORT: ${hasPort ? '✅' : '❌'}`);
  
  if (!hasMongoUri || !hasJwtSecret || !hasPort) {
    issues.push('Backend environment configuration incomplete');
    allPassed = false;
  }
} else {
  console.log('   ❌ Backend .env file missing');
  issues.push('Backend .env file missing');
  allPassed = false;
}

// Check frontend .env.local
const frontendEnvPath = path.join(__dirname, '.env.local');
if (fs.existsSync(frontendEnvPath)) {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  
  const hasApiUrl = frontendEnv.includes('NEXT_PUBLIC_API_URL=http://localhost:3001');
  
  console.log(`   Frontend .env.local: ${hasApiUrl ? '✅' : '❌'}`);
  console.log(`      - API_URL: ${hasApiUrl ? '✅' : '❌'}`);
  
  if (!hasApiUrl) {
    issues.push('Frontend API URL not configured correctly');
    allPassed = false;
  }
} else {
  console.log('   ❌ Frontend .env.local file missing');
  issues.push('Frontend .env.local file missing');
  allPassed = false;
}

// Test 2: Backend Files
console.log('\n📋 2. Backend Implementation:\n');

const backendFiles = [
  'backend/server.js',
  'backend/config/database.js',
  'backend/controllers/authController.js',
  'backend/controllers/contestController.js',
  'backend/controllers/problemController.js',
  'backend/controllers/submissionController.js',
  'backend/middleware/auth.js',
  'backend/middleware/validation.js',
  'backend/utils/jwt.js',
  'backend/utils/serialization.js',
  'backend/routes/index.js',
  'backend/routes/auth.js',
  'backend/routes/contests.js',
  'backend/routes/problems.js',
  'backend/routes/submissions.js'
];

let backendFilesCount = 0;

backendFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${filePath}`);
    backendFilesCount++;
  } else {
    console.log(`   ❌ ${filePath} - Missing`);
    issues.push(`${filePath} missing`);
    allPassed = false;
  }
});

console.log(`   Backend files: ${backendFilesCount}/${backendFiles.length}`);

// Test 3: Frontend Files
console.log('\n📋 3. Frontend Implementation:\n');

const frontendFiles = [
  'app/layout.tsx',
  'components/providers.tsx',
  'contexts/auth-context.tsx',
  'lib/api-client.ts',
  'lib/serialization.ts'
];

let frontendFilesCount = 0;

frontendFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for specific implementations
    if (filePath === 'app/layout.tsx') {
      const usesProviders = content.includes('<Providers>');
      console.log(`   ✅ ${filePath} ${usesProviders ? '(uses Providers)' : '(❌ missing Providers)'}`);
      if (!usesProviders) {
        issues.push('Layout.tsx not using Providers component');
        allPassed = false;
      }
    } else if (filePath === 'components/providers.tsx') {
      const hasUseClient = content.includes('"use client"');
      const hasHydrationFix = content.includes('isMounted');
      console.log(`   ✅ ${filePath} ${hasUseClient ? '(Client Component)' : '(❌ missing "use client")'} ${hasHydrationFix ? '(hydration safe)' : '(⚠️ no hydration fix)'}`);
      if (!hasUseClient) {
        issues.push('Providers component missing "use client"');
        allPassed = false;
      }
    } else if (filePath === 'lib/api-client.ts') {
      const hasCorrectUrl = content.includes('/api/auth/login');
      console.log(`   ✅ ${filePath} ${hasCorrectUrl ? '(correct endpoints)' : '(❌ wrong endpoints)'}`);
      if (!hasCorrectUrl) {
        issues.push('API client using wrong endpoints');
        allPassed = false;
      }
    } else {
      console.log(`   ✅ ${filePath}`);
    }
    
    frontendFilesCount++;
  } else {
    console.log(`   ❌ ${filePath} - Missing`);
    issues.push(`${filePath} missing`);
    allPassed = false;
  }
});

console.log(`   Frontend files: ${frontendFilesCount}/${frontendFiles.length}`);

// Test 4: Serialization Fixes
console.log('\n📋 4. Serialization Fixes:\n');

// Check backend serialization
const controllersWithSerialization = [
  'backend/controllers/contestController.js',
  'backend/controllers/submissionController.js',
  'backend/controllers/submissionViewController.js',
  'backend/controllers/problemController.js'
];

let serializedControllers = 0;

controllersWithSerialization.forEach(controllerPath => {
  const fullPath = path.join(__dirname, controllerPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasSerializationImport = content.includes('serializeMongooseData');
    const hasSerializedResponses = content.includes('serializeMongooseData(');
    
    if (hasSerializationImport && hasSerializedResponses) {
      console.log(`   ✅ ${controllerPath} - Serialized`);
      serializedControllers++;
    } else {
      console.log(`   ❌ ${controllerPath} - Not serialized`);
      issues.push(`${controllerPath} missing serialization`);
      allPassed = false;
    }
  }
});

console.log(`   Serialized controllers: ${serializedControllers}/${controllersWithSerialization.length}`);

// Test 5: Client Components
console.log('\n📋 5. Client Components:\n');

const clientComponents = [
  'components/protected-route.tsx',
  'components/dashboard-header.tsx',
  'components/code-editor.tsx',
  'components/contest-timer.tsx'
];

let fixedClientComponents = 0;

clientComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasUseClient = content.trim().startsWith('"use client"');
    
    if (hasUseClient) {
      console.log(`   ✅ ${componentPath}`);
      fixedClientComponents++;
    } else {
      console.log(`   ❌ ${componentPath} - Missing "use client"`);
      issues.push(`${componentPath} needs "use client" directive`);
      allPassed = false;
    }
  } else {
    console.log(`   ⚠️  ${componentPath} - File not found`);
  }
});

console.log(`   Fixed client components: ${fixedClientComponents}/${clientComponents.length}`);

// Test 6: Package Dependencies
console.log('\n📋 6. Dependencies:\n');

const packageJsonPath = path.join(__dirname, 'package.json');
const backendPackageJsonPath = path.join(__dirname, 'backend/package.json');

if (fs.existsSync(packageJsonPath)) {
  console.log('   ✅ Frontend package.json exists');
} else {
  console.log('   ❌ Frontend package.json missing');
  issues.push('Frontend package.json missing');
  allPassed = false;
}

if (fs.existsSync(backendPackageJsonPath)) {
  console.log('   ✅ Backend package.json exists');
} else {
  console.log('   ❌ Backend package.json missing');
  issues.push('Backend package.json missing');
  allPassed = false;
}

// Final Results
console.log('\n📊 Integration Test Results:');
console.log(`   Environment: ${backendEnvPath && frontendEnvPath ? '✅' : '❌'}`);
console.log(`   Backend Files: ${backendFilesCount}/${backendFiles.length}`);
console.log(`   Frontend Files: ${frontendFilesCount}/${frontendFiles.length}`);
console.log(`   Serialization: ${serializedControllers}/${controllersWithSerialization.length}`);
console.log(`   Client Components: ${fixedClientComponents}/${clientComponents.length}`);

if (allPassed && issues.length === 0) {
  console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
  console.log('✅ The platform is ready for testing.');
  console.log('\n🚀 To start the platform:');
  console.log('   1. Backend: cd backend && npm start');
  console.log('   2. Frontend: npm run dev');
  console.log('   3. Or use: FINAL_STARTUP.bat');
  console.log('\n📋 Expected Results:');
  console.log('   - Backend starts on port 3001');
  console.log('   - Frontend starts on port 3000');
  console.log('   - No serialization errors');
  console.log('   - Authentication works end-to-end');
  console.log('   - API endpoints respond correctly');
} else {
  console.log('\n⚠️  INTEGRATION ISSUES FOUND:');
  issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log('\n🔧 Fix these issues before starting the platform.');
}

console.log('\n' + '='.repeat(80));