@echo off
title CodeContest Pro - Final Setup
color 0A

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║        CodeContest Pro - Final Setup         ║
echo  ║           Production Ready Platform          ║
echo  ╚══════════════════════════════════════════════╝
echo.

echo [STEP 1] Checking system requirements...

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is available

:: Check ports
echo [STEP 2] Checking port availability...

netstat -an | find "3001" | find "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  Port 3001 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| find "3001" ^| find "LISTENING"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

netstat -an | find "5000" | find "LISTENING" >nul
if not errorlevel 1 (
    echo ⚠️  Port 5000 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| find "5000" ^| find "LISTENING"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo ✅ Ports are ready

echo [STEP 3] Installing dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --silent
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend dependencies found
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install --silent
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ✅ Backend dependencies found
)

echo [STEP 4] Environment configuration check...
if not exist "backend\.env" (
    echo ❌ Backend .env file not found
    echo Please ensure backend/.env exists with proper configuration
    pause
    exit /b 1
)
echo ✅ Environment configuration found

echo [STEP 5] Database seeding (optional)...
set /p seed_choice="Seed database with 360+ problems? (y/n): "

if /i "%seed_choice%"=="y" (
    echo 🌱 Seeding database...
    cd backend
    call npm run seed
    if errorlevel 1 (
        echo ⚠️  Database seeding failed (continuing anyway)
        echo You can run 'npm run seed' in the backend folder later
    ) else (
        echo ✅ Database seeded successfully!
    )
    cd ..
)

echo [STEP 6] Starting services...
echo.
echo 🚀 Starting CodeContest Pro Platform...
echo.

:: Start backend
echo Starting backend server (port 3001)...
start "CodeContest Backend" cmd /c "cd backend && echo Backend starting... && npm start"

:: Wait for backend
echo Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

:: Start frontend
echo Starting frontend server (port 5000)...
start "CodeContest Frontend" cmd /c "echo Frontend starting... && npm run dev:local"

echo.
echo ✅ Services are starting up!
echo.
echo 📊 Platform Information:
echo    🌐 Frontend: http://localhost:5000
echo    📡 Backend:  http://localhost:3001/api
echo    🔍 Health:   http://localhost:3001/api/health
echo.
echo 🔑 Default Admin Credentials (if seeded):
echo    📧 Email:    admin@codecontest.com
echo    🔒 Password: admin123
echo.
echo 🎯 Platform Features:
echo    ✅ 360+ Programming Problems
echo    ✅ Real-time Code Execution (Mock Mode)
echo    ✅ Plagiarism Detection (JPlag Integration)
echo    ✅ Live Leaderboards & WebSocket Updates
echo    ✅ Contest Management & Analytics
echo    ✅ Activity Logging & Real-time Feeds
echo.
echo ⏳ Waiting 15 seconds then opening browser...
timeout /t 15 /nobreak >nul

:: Open browser
start http://localhost:5000

echo.
echo 🎉 CodeContest Pro is now running!
echo.
echo 📝 Next Steps:
echo    1. Register as a teacher to create contests
echo    2. Register as a student to participate
echo    3. Add Judge0 API key for real code execution
echo    4. Customize problems and contests as needed
echo.
echo 🛑 To stop services:
echo    - Close both terminal windows
echo    - Or press Ctrl+C in each window
echo.
echo 📚 Documentation:
echo    - IMPLEMENTATION_SUMMARY.md - Complete feature list
echo    - TROUBLESHOOTING.md - Common issues and solutions
echo    - LOCAL_DEPLOYMENT.md - Detailed setup guide
echo.
pause