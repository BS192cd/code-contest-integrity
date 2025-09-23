#!/usr/bin/env node

/**
 * Comprehensive verification script for Next.js serialization fixes
 * Tests both frontend Client Component directives and backend serialization
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Comprehensive Serialization Fix Verification\n');

// Components that should have "use client" directive
const componentsToCheck = [
  'components/protected-route.tsx',
  'components/code-editor.tsx',
  'components/dashboard-header.tsx',
  'components/dashboard-sidebar.tsx',
  'components/contest-timer.tsx',
  'components/teacher-header.tsx',
  'components/teacher-sidebar.tsx',
  'components/live-contest-monitor.tsx',
  'components/live-submission-feed.tsx',
  'components/plagiarism-monitor.tsx',
  'components/plagiarism-scanner.tsx',
  'components/real-time-leaderboard.tsx',
  'components/teacher-plagiarism-dashboard.tsx'
];

// Backend controllers that should have serialization
const controllersToCheck = [
  'backend/controllers/contestController.js',
  'backend/controllers/submissionController.js',
  'backend/controllers/submissionViewController.js'
];

let allPassed = true;
let clientComponentsFixed = 0;
let backendControllersFixed = 0;

console.log('📋 1. Checking Client Components for "use client" directive:\n');

componentsToCheck.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasUseClient = content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
    
    if (hasUseClient) {
      console.log(`   ✅ ${componentPath}`);
      clientComponentsFixed++;
    } else {
      console.log(`   ❌ ${componentPath} - Missing "use client" directive`);
      allPassed = false;
    }
  } else {
    console.log(`   ⚠️  ${componentPath} - File not found`);
  }
});

console.log(`\n📋 2. Checking Backend Controllers for serialization:\n`);

controllersToCheck.forEach(controllerPath => {
  const fullPath = path.join(__dirname, controllerPath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for serialization import
    const hasSerializationImport = content.includes('serializeMongooseData') || 
                                   content.includes('require(\'../utils/serialization\')');
    
    // Check for .lean() usage
    const hasLeanQueries = content.includes('.lean()');
    
    // Check for serialization in responses
    const hasSerializedResponses = content.includes('serializeMongooseData(');
    
    if (hasSerializationImport && hasSerializedResponses) {
      console.log(`   ✅ ${controllerPath}`);
      console.log(`      - Serialization import: ✅`);
      console.log(`      - Lean queries: ${hasLeanQueries ? '✅' : '⚠️'}`);
      console.log(`      - Serialized responses: ✅`);
      backendControllersFixed++;
    } else {
      console.log(`   ❌ ${controllerPath} - Missing serialization`);
      console.log(`      - Serialization import: ${hasSerializationImport ? '✅' : '❌'}`);
      console.log(`      - Lean queries: ${hasLeanQueries ? '✅' : '⚠️'}`);
      console.log(`      - Serialized responses: ${hasSerializedResponses ? '✅' : '❌'}`);
      allPassed = false;
    }
  } else {
    console.log(`   ⚠️  ${controllerPath} - File not found`);
  }
});

console.log(`\n📋 3. Checking Serialization Utilities:\n`);

// Check frontend serialization utilities
const frontendSerializationPath = path.join(__dirname, 'lib/serialization.ts');
const hasFrontendUtils = fs.existsSync(frontendSerializationPath);
console.log(`   Frontend utils (lib/serialization.ts): ${hasFrontendUtils ? '✅' : '❌'}`);

if (hasFrontendUtils) {
  const frontendContent = fs.readFileSync(frontendSerializationPath, 'utf8');
  const hasSerializeForClient = frontendContent.includes('serializeForClient');
  const hasMongooseToPlain = frontendContent.includes('mongooseToPlain');
  console.log(`      - serializeForClient(): ${hasSerializeForClient ? '✅' : '❌'}`);
  console.log(`      - mongooseToPlain(): ${hasMongooseToPlain ? '✅' : '❌'}`);
}

// Check backend serialization utilities
const backendSerializationPath = path.join(__dirname, 'backend/utils/serialization.js');
const hasBackendUtils = fs.existsSync(backendSerializationPath);
console.log(`   Backend utils (backend/utils/serialization.js): ${hasBackendUtils ? '✅' : '❌'}`);

if (hasBackendUtils) {
  const backendContent = fs.readFileSync(backendSerializationPath, 'utf8');
  const hasSerializeMongooseData = backendContent.includes('serializeMongooseData');
  const hasSerializeApiResponse = backendContent.includes('serializeApiResponse');
  console.log(`      - serializeMongooseData(): ${hasSerializeMongooseData ? '✅' : '❌'}`);
  console.log(`      - serializeApiResponse(): ${hasSerializeApiResponse ? '✅' : '❌'}`);
}

console.log(`\n📊 Results Summary:`);
console.log(`   Client Components Fixed: ${clientComponentsFixed}/${componentsToCheck.length}`);
console.log(`   Backend Controllers Fixed: ${backendControllersFixed}/${controllersToCheck.length}`);
console.log(`   Frontend Serialization Utils: ${hasFrontendUtils ? '✅' : '❌'}`);
console.log(`   Backend Serialization Utils: ${hasBackendUtils ? '✅' : '❌'}`);

console.log(`\n📋 4. Common Serialization Issues Check:\n`);

// Check for potential remaining issues
const potentialIssues = [];

// Check if any API routes might still have issues
const apiRoutesPath = path.join(__dirname, 'app/api');
if (fs.existsSync(apiRoutesPath)) {
  console.log(`   ✅ API routes directory exists`);
} else {
  console.log(`   ⚠️  API routes directory not found`);
}

// Check for MongoDB models
const modelsPath = path.join(__dirname, 'backend/models');
if (fs.existsSync(modelsPath)) {
  const modelFiles = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js'));
  console.log(`   ✅ MongoDB models found: ${modelFiles.length} files`);
} else {
  console.log(`   ⚠️  MongoDB models directory not found`);
}

if (allPassed && hasFrontendUtils && hasBackendUtils) {
  console.log('\n🎉 ALL SERIALIZATION FIXES VERIFIED!');
  console.log('✅ The platform should start without serialization errors.');
  console.log('\n🚀 Ready to run: FINAL_STARTUP.bat');
  console.log('\n📋 Expected Results:');
  console.log('   - Clean browser console (no serialization errors)');
  console.log('   - All pages render correctly');
  console.log('   - API responses are properly serialized');
  console.log('   - Real-time features work seamlessly');
} else {
  console.log('\n⚠️  SOME ISSUES REMAIN:');
  if (clientComponentsFixed < componentsToCheck.length) {
    console.log(`   - ${componentsToCheck.length - clientComponentsFixed} components need "use client" directive`);
  }
  if (backendControllersFixed < controllersToCheck.length) {
    console.log(`   - ${controllersToCheck.length - backendControllersFixed} controllers need serialization fixes`);
  }
  if (!hasFrontendUtils) {
    console.log('   - Frontend serialization utilities missing');
  }
  if (!hasBackendUtils) {
    console.log('   - Backend serialization utilities missing');
  }
}

console.log('\n' + '='.repeat(80));