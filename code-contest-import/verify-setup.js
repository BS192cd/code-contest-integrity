const fs = require('fs');
const path = require('path');

console.log('🔍 CodeContest Pro - Setup Verification\n');

// Check Node.js version
console.log('1. Node.js Version:');
console.log(`   ✓ ${process.version}\n`);

// Check required files
console.log('2. Required Files:');
const requiredFiles = [
  'package.json',
  'backend/package.json',
  'backend/server.js',
  'backend/.env',
  '.replit'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✓' : '❌'} ${file}`);
});

// Check dependencies
console.log('\n3. Dependencies:');
const frontendNodeModules = fs.existsSync(path.join(__dirname, 'node_modules'));
const backendNodeModules = fs.existsSync(path.join(__dirname, 'backend/node_modules'));

console.log(`   ${frontendNodeModules ? '✓' : '❌'} Frontend dependencies (node_modules)`);
console.log(`   ${backendNodeModules ? '✓' : '❌'} Backend dependencies (backend/node_modules)`);

// Check environment variables
console.log('\n4. Environment Configuration:');
require('dotenv').config({ path: './backend/.env' });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const optionalEnvVars = ['JPLAG_API_KEY', 'JUDGE0_API_KEY'];

requiredEnvVars.forEach(envVar => {
  const exists = !!process.env[envVar];
  console.log(`   ${exists ? '✓' : '❌'} ${envVar} (required)`);
});

optionalEnvVars.forEach(envVar => {
  const exists = !!process.env[envVar];
  console.log(`   ${exists ? '✓' : '⚠️'} ${envVar} (optional - ${exists ? 'real mode' : 'mock mode'})`);
});

// Summary
console.log('\n📋 Setup Summary:');
const allRequiredFilesExist = requiredFiles.every(file => 
  fs.existsSync(path.join(__dirname, file))
);
const allRequiredEnvVarsSet = requiredEnvVars.every(envVar => !!process.env[envVar]);
const dependenciesInstalled = frontendNodeModules && backendNodeModules;

if (allRequiredFilesExist && allRequiredEnvVarsSet && dependenciesInstalled) {
  console.log('   ✅ Ready to deploy! All requirements met.');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Run: .\\start-local.ps1 (PowerShell)');
  console.log('   2. Or run: start-local.bat (Command Prompt)');
  console.log('   3. Or manually start backend and frontend');
} else {
  console.log('   ⚠️  Setup incomplete. Please address the issues above.');
  
  if (!dependenciesInstalled) {
    console.log('\n📦 Install Dependencies:');
    console.log('   npm install && cd backend && npm install');
  }
  
  if (!allRequiredEnvVarsSet) {
    console.log('\n🔧 Configure Environment:');
    console.log('   Check backend/.env file for missing variables');
  }
}

console.log('\n📖 For detailed instructions, see LOCAL_DEPLOYMENT.md');
console.log('📊 For complete feature list, see DEPLOYMENT_SUMMARY.md');