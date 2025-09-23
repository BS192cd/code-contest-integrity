@echo off
echo ========================================
echo   CodeContest Pro - Local Deployment
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/4] Installing dependencies...
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo ✓ All dependencies installed

echo.
echo [3/4] Starting services...
echo Starting backend server on port 3001...
start "CodeContest Backend" cmd /k "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend server on port 5000...
start "CodeContest Frontend" cmd /k "npm run dev"

echo.
echo [4/4] Services started!
echo ========================================
echo   CodeContest Pro is now running!
echo ========================================
echo.
echo Frontend: http://localhost:5000
echo Backend:  http://localhost:3001/api
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5000

echo.
echo To stop the services, close both terminal windows
echo or press Ctrl+C in each terminal
pause