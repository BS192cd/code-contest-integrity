# CodeContest Pro - Local Deployment Guide

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
Run the startup script for your system:

**Windows (PowerShell):**
```powershell
.\start-local.ps1
```

**Windows (Command Prompt):**
```cmd
start-local.bat
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on: http://localhost:3001

3. **Start Frontend Server** (in new terminal)
   ```bash
   npm run dev:local
   ```
   Frontend will run on: http://localhost:5000

## 🔧 Configuration

### Environment Variables
All necessary environment variables are already configured in `backend/.env`:
- ✅ MongoDB connection (your Atlas cluster)
- ✅ JWT secret for authentication
- ✅ JPlag API key for plagiarism detection
- ✅ CORS settings for local development

### Database
- Uses your existing MongoDB Atlas cluster
- No additional database setup required
- Automatic collection creation on first use

## 📊 Access Points

Once running locally:
- **Frontend Application**: http://localhost:5000
- **Backend API**: http://localhost:3001/api
- **API Health Check**: http://localhost:3001/api/health
- **WebSocket**: ws://localhost:3001

## 🧪 Testing the Platform

### 1. Create Test Accounts
- Register as a student: http://localhost:5000/auth/register
- Register as a teacher: http://localhost:5000/auth/register (select teacher role)

### 2. Test Teacher Features
- Create a contest
- Add problems with test cases
- Monitor submissions
- Run plagiarism detection

### 3. Test Student Features
- Join contests
- Submit code solutions
- View real-time leaderboards
- Check personal analytics

## 🔍 Verification Checklist

### ✅ Backend Services
- [ ] Server starts on port 3001
- [ ] Database connection established
- [ ] API endpoints responding
- [ ] WebSocket server running

### ✅ Frontend Services
- [ ] Next.js app starts on port 5000
- [ ] Pages load correctly
- [ ] Authentication works
- [ ] Real-time features active

### ✅ Core Features
- [ ] User registration/login
- [ ] Contest creation and joining
- [ ] Code submission and execution
- [ ] Leaderboard updates
- [ ] Plagiarism detection

## 🛠️ Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using the port
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill the process if needed
taskkill /PID <process_id> /F
```

**Database Connection Issues:**
- Verify MongoDB Atlas allows connections from your IP
- Check MONGO_URI format in backend/.env
- Ensure network connectivity

**CORS Errors:**
- Frontend and backend must run on specified ports
- Check WEBSOCKET_CORS_ORIGINS in backend/.env

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development Tips

### Hot Reloading
- Frontend: Automatic reload on file changes
- Backend: Restart required for changes (or use nodemon)

### Debugging
- Backend logs: Check terminal running `npm start`
- Frontend logs: Check browser console
- API testing: Use tools like Postman or curl

### Database Inspection
- Use MongoDB Compass with your connection string
- Or MongoDB Atlas web interface

## 🔄 Stopping Services

### Graceful Shutdown
1. Press `Ctrl+C` in both terminal windows
2. Or close the terminal windows

### Force Stop (if needed)
```bash
# Windows
taskkill /f /im node.exe

# Or find specific processes
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

## 🎯 Next Steps

1. **Test All Features**: Go through the verification checklist
2. **Customize Settings**: Modify configurations as needed
3. **Add Judge0 API**: For real code execution (optional)
4. **Deploy to Production**: When ready for live use

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure ports 3001 and 5000 are available
4. Test API endpoints individually

---

**🎉 Your CodeContest Pro platform is ready for local development!**