const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 CodeContest Pro - Debug Startup\n');

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
  'app/page.tsx',
  'app/layout.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`   ${exists ? '✓' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
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

let allEnvVarsSet = true;
requiredEnvVars.forEach(envVar => {
  const exists = !!process.env[envVar];
  console.log(`   ${exists ? '✓' : '❌'} ${envVar} (required)`);
  if (!exists) allEnvVarsSet = false;
});

optionalEnvVars.forEach(envVar => {
  const exists = !!process.env[envVar];
  console.log(`   ${exists ? '✓' : '⚠️'} ${envVar} (optional - ${exists ? 'real mode' : 'mock mode'})`);
});

// Check ports
console.log('\n5. Port Availability:');
const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function checkPorts() {
  const port3001Available = await checkPort(3001);
  const port5000Available = await checkPort(5000);
  
  console.log(`   ${port3001Available ? '✓' : '❌'} Port 3001 (backend) ${port3001Available ? 'available' : 'in use'}`);
  console.log(`   ${port5000Available ? '✓' : '❌'} Port 5000 (frontend) ${port5000Available ? 'available' : 'in use'}`);
  
  // Summary and recommendations
  console.log('\n📋 Diagnosis:');
  
  if (!allFilesExist) {
    console.log('   ❌ Missing required files - check project structure');
  }
  
  if (!frontendNodeModules) {
    console.log('   ❌ Frontend dependencies missing - run: npm install');
  }
  
  if (!backendNodeModules) {
    console.log('   ❌ Backend dependencies missing - run: cd backend && npm install');
  }
  
  if (!allEnvVarsSet) {
    console.log('   ❌ Missing required environment variables - check backend/.env');
  }
  
  if (!port3001Available) {
    console.log('   ❌ Port 3001 in use - kill existing process or use different port');
  }
  
  if (!port5000Available) {
    console.log('   ❌ Port 5000 in use - kill existing process or use different port');
  }
  
  if (allFilesExist && frontendNodeModules && backendNodeModules && allEnvVarsSet && port3001Available && port5000Available) {
    console.log('   ✅ All checks passed! Ready to start services.');
    console.log('\n🚀 Starting services...');
    
    // Start backend
    console.log('\n📡 Starting backend server...');
    const backend = spawn('npm', ['start'], { 
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit',
      shell: true 
    });
    
    // Wait a bit then start frontend
    setTimeout(() => {
      console.log('\n🌐 Starting frontend server...');
      const frontend = spawn('npm', ['run', 'dev:local'], { 
        cwd: __dirname,
        stdio: 'inherit',
        shell: true 
      });
      
      // Handle process cleanup
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down services...');
        backend.kill();
        frontend.kill();
        process.exit(0);
      });
      
    }, 3000);
    
  } else {
    console.log('   ⚠️  Issues found. Please resolve the above problems before starting.');
    console.log('\n🔧 Quick fixes:');
    console.log('   1. Install dependencies: npm install && cd backend && npm install');
    console.log('   2. Check environment variables in backend/.env');
    console.log('   3. Kill processes using ports 3001 and 5000');
  }
}

checkPorts();