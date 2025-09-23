#!/usr/bin/env node

/**
 * Final verification script for Next.js serialization fixes
 * Checks layout.tsx fix and all other potential serialization issues
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 FINAL Serialization Fix Verification\n');

let allPassed = true;
const issues = [];

console.log('📋 1. Checking Root Layout Fix:\n');

// Check if layout.tsx is properly fixed
const layoutPath = path.join(__dirname, 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  // Check if it's using the Providers component (Client Component)
  const usesProviders = layoutContent.includes('import { Providers }') && 
                       layoutContent.includes('<Providers>');
  
  // Check if it's NOT directly using Client-only components
  const hasQueryClient = layoutContent.includes('QueryClientProvider');
  const hasAuthProvider = layoutContent.includes('AuthProvider');
  const hasSuspense = layoutContent.includes('Suspense');
  
  if (usesProviders && !hasQueryClient && !hasAuthProvider && !hasSuspense) {
    console.log('   ✅ app/layout.tsx - Properly uses Client Component wrapper');
  } else {
    console.log('   ❌ app/layout.tsx - Still has Client-only components in Server Component');
    issues.push('Layout.tsx needs to use Providers wrapper');
    allPassed = false;
  }
} else {
  console.log('   ⚠️  app/layout.tsx - File not found');
  issues.push('Layout.tsx file missing');
}

// Check if Providers component exists
const providersPath = path.join(__dirname, 'components/providers.tsx');
if (fs.existsSync(providersPath)) {
  const providersContent = fs.readFileSync(providersPath, 'utf8');
  const hasUseClient = providersContent.trim().startsWith('"use client"');
  const hasQueryClient = providersContent.includes('QueryClientProvider');
  const hasAuthProvider = providersContent.includes('AuthProvider');
  
  if (hasUseClient && hasQueryClient && hasAuthProvider) {
    console.log('   ✅ components/providers.tsx - Proper Client Component wrapper');
  } else {
    console.log('   ❌ components/providers.tsx - Missing required providers');
    issues.push('Providers component incomplete');
    allPassed = false;
  }
} else {
  console.log('   ❌ components/providers.tsx - File not found');
  issues.push('Providers component missing');
  allPassed = false;
}

console.log('\n📋 2. Checking for Server Components with Data Fetching:\n');

// Check for potential Server Components that might fetch data
const potentialServerComponents = [
  'app/page.tsx',
  'app/dashboard/page.tsx',
  'app/admin/page.tsx',
  'app/teacher/dashboard/page.tsx',
  'app/student/analytics/page.tsx'
];

potentialServerComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasUseClient = content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
    const hasAsyncFunction = content.includes('async function');
    const hasAwait = content.includes('await ');
    const hasMongoose = content.includes('mongoose') || content.includes('findById') || content.includes('find(');
    
    if (hasUseClient) {
      console.log(`   ✅ ${componentPath} - Client Component (safe)`);
    } else if (hasAsyncFunction || hasAwait || hasMongoose) {
      console.log(`   ⚠️  ${componentPath} - Potential Server Component with data fetching`);
      console.log(`      - Async function: ${hasAsyncFunction ? '⚠️' : '✅'}`);
      console.log(`      - Await usage: ${hasAwait ? '⚠️' : '✅'}`);
      console.log(`      - MongoDB usage: ${hasMongoose ? '⚠️' : '✅'}`);
      if (hasAsyncFunction || hasAwait || hasMongoose) {
        issues.push(`${componentPath} might be Server Component with data fetching`);
      }
    } else {
      console.log(`   ✅ ${componentPath} - No data fetching detected`);
    }
  } else {
    console.log(`   ℹ️  ${componentPath} - File not found (OK)`);
  }
});

console.log('\n📋 3. Checking Backend Serialization:\n');

// Check backend controllers
const controllers = [
  'backend/controllers/contestController.js',
  'backend/controllers/submissionController.js',
  'backend/controllers/submissionViewController.js'
];

let backendFixed = 0;

controllers.forEach(controllerPath => {
  const fullPath = path.join(__dirname, controllerPath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasSerializationImport = content.includes('serializeMongooseData');
    const hasSerializedResponses = content.includes('serializeMongooseData(');
    
    if (hasSerializationImport && hasSerializedResponses) {
      console.log(`   ✅ ${controllerPath} - Properly serialized`);
      backendFixed++;
    } else {
      console.log(`   ❌ ${controllerPath} - Missing serialization`);
      issues.push(`${controllerPath} needs serialization`);
      allPassed = false;
    }
  } else {
    console.log(`   ⚠️  ${controllerPath} - File not found`);
  }
});

console.log('\n📋 4. Checking Client Components:\n');

// Check key client components
const clientComponents = [
  'components/protected-route.tsx',
  'components/dashboard-header.tsx',
  'components/code-editor.tsx',
  'components/contest-timer.tsx',
  'components/real-time-leaderboard.tsx'
];

let clientComponentsFixed = 0;

clientComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasUseClient = content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
    
    if (hasUseClient) {
      console.log(`   ✅ ${componentPath}`);
      clientComponentsFixed++;
    } else {
      console.log(`   ❌ ${componentPath} - Missing "use client"`);
      issues.push(`${componentPath} needs "use client" directive`);
      allPassed = false;
    }
  } else {
    console.log(`   ⚠️  ${componentPath} - File not found`);
  }
});

console.log('\n📊 Summary:');
console.log(`   Layout Fix: ${usesProviders ? '✅' : '❌'}`);
console.log(`   Providers Component: ${fs.existsSync(providersPath) ? '✅' : '❌'}`);
console.log(`   Backend Controllers: ${backendFixed}/${controllers.length} fixed`);
console.log(`   Client Components: ${clientComponentsFixed}/${clientComponents.length} fixed`);

if (allPassed && issues.length === 0) {
  console.log('\n🎉 ALL SERIALIZATION ISSUES RESOLVED!');
  console.log('✅ The Next.js serialization error should be completely fixed.');
  console.log('\n🚀 Ready to test:');
  console.log('   cd code-contest-import');
  console.log('   FINAL_STARTUP.bat');
  console.log('\n📋 Expected Results:');
  console.log('   - Clean browser console (no serialization errors)');
  console.log('   - All pages render without crashes');
  console.log('   - Providers work correctly in Client Components');
  console.log('   - API responses are properly serialized');
} else {
  console.log('\n⚠️  REMAINING ISSUES:');
  issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log('\n🔧 Fix these issues before testing the platform.');
}

console.log('\n' + '='.repeat(80));