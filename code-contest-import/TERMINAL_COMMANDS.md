# Terminal Commands Reference

## 🖥️ **Where to Run Commands**

### **Root Directory Commands**
**Location**: `code-contest-import/`
```bash
# System status check
node check-status.js

# Install frontend dependencies
npm install

# Start frontend only
npm run dev:local

# Build frontend for production
npm run build
```

### **Backend Directory Commands**
**Location**: `code-contest-import/backend/`
```bash
# Install backend dependencies
npm install

# Start backend server
npm start

# Start backend in development mode
npm run dev

# Seed database with problems
npm run seed

# Seed only problems
npm run seed:problems

# Complete database setup
npm run seed:database
```

## 🚀 **Quick Start Commands**

### **Complete Setup (Automated)**
**Location**: `code-contest-import/`
```cmd
FINAL_STARTUP.bat
```

### **Manual Setup**
**Location**: `code-contest-import/`
```bash
# 1. Install all dependencies
npm install && cd backend && npm install && cd ..

# 2. Seed database (optional)
cd backend && npm run seed && cd ..

# 3. Start backend (Terminal 1)
cd backend && npm start

# 4. Start frontend (Terminal 2)
npm run dev:local
```

## 🔍 **Diagnostic Commands**

### **Check System Status**
**Location**: `code-contest-import/`
```bash
node check-status.js
```

### **Check Port Usage**
**Location**: Any
```cmd
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill process by PID
taskkill /PID <process_id> /F
```

### **Check Node.js Version**
**Location**: Any
```bash
node --version
npm --version
```

## 🛠️ **Development Commands**

### **Database Operations**
**Location**: `code-contest-import/backend/`
```bash
# Seed complete database
npm run seed

# Seed only problems
npm run seed:problems

# Reset and reseed
npm run seed:database
```

### **Service Management**
**Location**: `code-contest-import/`
```bash
# Backend only
cd backend && npm start

# Frontend only
npm run dev:local

# Both services (manual)
# Terminal 1: cd backend && npm start
# Terminal 2: npm run dev:local
```

## 🧪 **Testing Commands**

### **API Health Check**
**Location**: Any (after services are running)
```bash
# Test backend health
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:5000
```

### **Database Connection Test**
**Location**: `code-contest-import/backend/`
```bash
# Test MongoDB connection
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected')).catch(err => console.log('❌ Failed:', err.message))"
```

## 🔧 **Troubleshooting Commands**

### **Clear Cache and Reinstall**
**Location**: `code-contest-import/`
```bash
# Clear frontend cache
rm -rf .next node_modules package-lock.json
npm install

# Clear backend cache
cd backend
rm -rf node_modules package-lock.json
npm install
cd ..
```

### **Port Management**
**Location**: Any
```cmd
# Windows - Kill all Node processes
taskkill /f /im node.exe

# Windows - Kill specific port
for /f "tokens=5" %a in ('netstat -ano ^| find "3001"') do taskkill /PID %a /F
for /f "tokens=5" %a in ('netstat -ano ^| find "5000"') do taskkill /PID %a /F
```

## 📊 **Monitoring Commands**

### **View Logs**
**Location**: Services should be running
```bash
# Backend logs - check the terminal where backend is running
# Frontend logs - check the terminal where frontend is running
# Browser logs - F12 Developer Tools > Console
```

### **Check Service Status**
**Location**: Any
```bash
# Check if services are responding
curl -s http://localhost:3001/api/health
curl -s http://localhost:5000
```

## 🎯 **Production Commands**

### **Build for Production**
**Location**: `code-contest-import/`
```bash
# Build frontend
npm run build

# Start production frontend
npm start

# Backend is already production-ready with npm start
```

### **Environment Setup**
**Location**: `code-contest-import/backend/`
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test environment variables
node -e "require('dotenv').config(); console.log('MONGO_URI:', !!process.env.MONGO_URI); console.log('JWT_SECRET:', !!process.env.JWT_SECRET);"
```

## ⚡ **Quick Reference**

| Task | Location | Command |
|------|----------|---------|
| **Full Setup** | Root | `FINAL_STARTUP.bat` |
| **Status Check** | Root | `node check-status.js` |
| **Install Deps** | Root | `npm install && cd backend && npm install` |
| **Seed Database** | Backend | `npm run seed` |
| **Start Backend** | Backend | `npm start` |
| **Start Frontend** | Root | `npm run dev:local` |
| **Kill Ports** | Any | `taskkill /f /im node.exe` |
| **Health Check** | Any | `curl localhost:3001/api/health` |

---

**💡 Tip**: Always run the status check first to identify any issues before starting services!