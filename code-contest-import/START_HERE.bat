@echo off
title CodeContest Pro Startup
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║        CodeContest Pro Startup       ║
echo  ╚══════════════════════════════════════╝
echo.

echo [STEP 1] Checking dependencies...
if not exist "node_modules" (
    echo ❌ Frontend dependencies missing!
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies found
)

if not exist "backend\node_modules" (
    echo ❌ Backend dependencies missing!
    echo Installing backend dependencies...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies found
)

echo.
echo [STEP 2] Starting Backend Server...
echo Starting backend on port 3001...
start "CodeContest Backend" cmd /c "cd backend && npm start && pause"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo [STEP 3] Starting Frontend Server...
echo Starting frontend on port 5000...
start "CodeContest Frontend" cmd /c "npm run dev:local && pause"

echo.
echo ✅ Services are starting!
echo.
echo 📡 Backend:  http://localhost:3001/api
echo 🌐 Frontend: http://localhost:5000
echo.
echo Waiting 10 seconds then opening browser...
timeout /t 10 /nobreak >nul

start http://localhost:5000

echo.
echo 🎉 CodeContest Pro is now running!
echo.
echo To stop the services:
echo - Close both terminal windows
echo - Or press Ctrl+C in each window
echo.
echo If you encounter issues, check TROUBLESHOOTING.md
echo.
pause