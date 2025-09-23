const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 CodeContest Pro - System Status Check\n');

// Check if files exist
const requiredFiles = [
  'package.json',
  'backend/package.json',
  'backend/.env',
  'backend/server.js',
  'app/layout.tsx',
  'app/page.tsx'
];

console.log('📁 File System Check:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check dependencies
console.log('\n📦 Dependencies Check:');
const frontendDeps = fs.existsSync(path.join(__dirname, 'node_modules'));
const backendDeps = fs.existsSync(path.join(__dirname, 'backend/node_modules'));

console.log(`   ${frontendDeps ? '✅' : '❌'} Frontend dependencies`);
console.log(`   ${backendDeps ? '✅' : '❌'} Backend dependencies`);

// Check environment variables
console.log('\n🔧 Environment Configuration:');
require('dotenv').config({ path: './backend/.env' });

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const optionalEnvVars = ['JUDGE0_API_KEY', 'JPLAG_API_KEY'];

let allEnvVarsSet = true;
requiredEnvVars.forEach(envVar => {
  const exists = !!process.env[envVar];
  console.log(`   ${exists ? '✅' : '❌'} ${envVar} (required)`);
  if (!exists) allEnvVarsSet = false;
});

optionalEnvVars.forEach(envVar => {
  const exists = !!process.env[envVar];
  const mode = exists ? 'production' : 'mock';
  console.log(`   ${exists ? '✅' : '⚠️'} ${envVar} (${mode} mode)`);
});

// Check ports
console.log('\n🌐 Port Availability:');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function checkPorts() {
  const port3001 = await checkPort(3001);
  const port5000 = await checkPort(5000);
  
  console.log(`   ${port3001 ? '✅' : '❌'} Port 3001 (backend) ${port3001 ? 'available' : 'in use'}`);
  console.log(`   ${port5000 ? '✅' : '❌'} Port 5000 (frontend) ${port5000 ? 'available' : 'in use'}`);
  
  // Overall status
  console.log('\n📊 Overall Status:');
  
  const issues = [];
  if (!allFilesExist) issues.push('Missing required files');
  if (!frontendDeps) issues.push('Frontend dependencies not installed');
  if (!backendDeps) issues.push('Backend dependencies not installed');
  if (!allEnvVarsSet) issues.push('Missing required environment variables');
  if (!port3001) issues.push('Port 3001 is in use');
  if (!port5000) issues.push('Port 5000 is in use');
  
  if (issues.length === 0) {
    console.log('   ✅ System is ready to start!');
    console.log('\n🚀 Ready to launch:');
    console.log('   Run: FINAL_STARTUP.bat');
    console.log('   Or:  START_WITH_SEEDING.bat');
  } else {
    console.log('   ⚠️  Issues found:');
    issues.forEach(issue => console.log(`      - ${issue}`));
    
    console.log('\n🔧 Quick fixes:');
    if (!frontendDeps || !backendDeps) {
      console.log('   npm install && cd backend && npm install');
    }
    if (!allEnvVarsSet) {
      console.log('   Check backend/.env file configuration');
    }
    if (!port3001 || !port5000) {
      console.log('   Kill processes using ports 3001 and 5000');
    }
  }
  
  console.log('\n📚 Documentation:');
  console.log('   - IMPLEMENTATION_SUMMARY.md - Complete feature overview');
  console.log('   - TROUBLESHOOTING.md - Common issues and solutions');
  console.log('   - LOCAL_DEPLOYMENT.md - Detailed setup instructions');
}

checkPorts();