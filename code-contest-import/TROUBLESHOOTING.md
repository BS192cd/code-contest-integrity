# CodeContest Pro - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: Page Doesn't Load / White Screen

**Symptoms:**
- Browser shows blank/white page
- Console errors about modules not found
- "Cannot resolve module" errors

**Solutions:**

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Clear Cache and Rebuild**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Same for backend
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   cd ..
   ```

3. **Check Node.js Version**
   ```bash
   node --version
   # Should be v18 or higher
   ```

### Issue 2: Port Already in Use

**Symptoms:**
- "EADDRINUSE" error
- "Port 3001/5000 is already in use"

**Solutions:**

1. **Kill Existing Processes**
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <process_id> /F
   
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```

2. **Use Different Ports**
   ```bash
   # Backend (edit backend/.env)
   PORT=3002
   
   # Frontend
   npm run dev -- --port 5001
   ```

### Issue 3: Database Connection Issues

**Symptoms:**
- "MongoDB connection error"
- "MONGO_URI is required"

**Solutions:**

1. **Check Environment Variables**
   ```bash
   # Verify backend/.env file exists and contains:
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=...
   ```

2. **Test MongoDB Connection**
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Test connection string in MongoDB Compass

### Issue 4: Module Resolution Errors

**Symptoms:**
- "Cannot resolve '@/components/ui/...'"
- "Module not found" errors

**Solutions:**

1. **Check TypeScript Configuration**
   ```json
   // tsconfig.json should have:
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. **Verify File Structure**
   ```
   code-contest-import/
   ├── components/ui/
   ├── app/
   ├── lib/
   └── contexts/
   ```

### Issue 5: Build Errors

**Symptoms:**
- TypeScript compilation errors
- Build fails with type errors

**Solutions:**

1. **Skip Type Checking (Quick Fix)**
   ```json
   // next.config.mjs already has:
   typescript: {
     ignoreBuildErrors: true,
   }
   ```

2. **Fix Type Issues**
   ```bash
   # Check for type errors
   npx tsc --noEmit
   ```

## 🔧 Quick Diagnostic Commands

### 1. Run Debug Script
```bash
node debug-startup.js
```

### 2. Check System Requirements
```bash
# Node.js version (should be 18+)
node --version

# NPM version
npm --version

# Check if ports are free
netstat -ano | findstr :3001
netstat -ano | findstr :5000
```

### 3. Test Individual Components

**Test Backend Only:**
```bash
cd backend
npm start
# Should show: "Server running on port 3001"
# Test: http://localhost:3001/api/health
```

**Test Frontend Only:**
```bash
npm run dev:local
# Should show: "Ready - started server on 0.0.0.0:5000"
# Test: http://localhost:5000
```

## 🚀 Step-by-Step Recovery

If nothing works, follow these steps:

### Step 1: Clean Installation
```bash
# Remove all dependencies
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json

# Reinstall everything
npm install
cd backend && npm install && cd ..
```

### Step 2: Verify Configuration
```bash
# Check environment file
cat backend/.env

# Should contain:
# MONGO_URI=mongodb+srv://...
# JWT_SECRET=...
# JPLAG_API_KEY=...
```

### Step 3: Test Services Individually
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend (after backend is running)
npm run dev:local
```

### Step 4: Check Browser Console
1. Open http://localhost:5000
2. Press F12 to open Developer Tools
3. Check Console tab for errors
4. Check Network tab for failed requests

## 🆘 Emergency Startup Script

If all else fails, use this minimal startup:

```bash
# Create emergency-start.bat
@echo off
echo Emergency startup...
cd backend
start cmd /k "npm start"
cd ..
timeout /t 5
start cmd /k "npx next dev --port 5000"
echo Services starting...
pause
```

## 📞 Getting Help

If you're still having issues:

1. **Check the Console Output**
   - Look for specific error messages
   - Note which service is failing (frontend/backend)

2. **Common Error Patterns**
   - `EADDRINUSE`: Port in use
   - `MODULE_NOT_FOUND`: Missing dependencies
   - `MONGO_URI`: Database configuration
   - `Cannot resolve`: Path/import issues

3. **Collect Information**
   - Node.js version: `node --version`
   - Operating system
   - Exact error message
   - Which step failed

## ✅ Success Indicators

You know it's working when:

- ✅ Backend shows: "Server running on port 3001"
- ✅ Frontend shows: "Ready - started server on 0.0.0.0:5000"
- ✅ http://localhost:3001/api/health returns JSON
- ✅ http://localhost:5000 shows the landing page
- ✅ No console errors in browser

---

**💡 Pro Tip:** Always start the backend first, wait for it to fully load, then start the frontend.