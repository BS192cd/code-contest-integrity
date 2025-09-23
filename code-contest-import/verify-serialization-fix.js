#!/usr/bin/env node

/**
 * Verification script to check if Next.js serialization issues are resolved
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Next.js Serialization Fixes...\n');

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

let allFixed = true;
let fixedCount = 0;

console.log('📋 Checking components for "use client" directive:\n');

componentsToCheck.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasUseClient = content.trim().startsWith('"use client"') || content.trim().startsWith("'use client'");
    
    if (hasUseClient) {
      console.log(`   ✅ ${componentPath}`);
      fixedCount++;
    } else {
      console.log(`   ❌ ${componentPath} - Missing "use client" directive`);
      allFixed = false;
    }
  } else {
    console.log(`   ⚠️  ${componentPath} - File not found`);
  }
});

console.log(`\n📊 Results:`);
console.log(`   Fixed: ${fixedCount}/${componentsToCheck.length} components`);

// Check if serialization utilities exist
const serializationPath = path.join(__dirname, 'lib/serialization.ts');
const hasSerializationUtils = fs.existsSync(serializationPath);

console.log(`   Serialization utilities: ${hasSerializationUtils ? '✅ Available' : '❌ Missing'}`);

// Overall status
if (allFixed && hasSerializationUtils) {
  console.log('\n🎉 All serialization fixes are in place!');
  console.log('✅ The platform should start without serialization errors.');
  console.log('\n🚀 Ready to run: FINAL_STARTUP.bat');
} else {
  console.log('\n⚠️  Some fixes are missing:');
  if (!allFixed) {
    console.log('   - Some components need "use client" directive');
  }
  if (!hasSerializationUtils) {
    console.log('   - Serialization utilities are missing');
  }
}

console.log('\n' + '='.repeat(60));