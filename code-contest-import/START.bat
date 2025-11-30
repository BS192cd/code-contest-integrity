@echo off
echo ========================================
echo  STARTING CODE CONTEST PLATFORM
echo ========================================
echo.

echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Starting Backend Server (Port 3001)...
cd backend
start "Backend - Port 3001" cmd /k "npm start"
cd ..

echo.
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 >nul

echo.
echo Starting Frontend Server (Port 5000)...
start "Frontend - Port 5000" cmd /k "npm run dev"

echo.
echo ========================================
echo  SERVERS STARTING
echo ========================================
echo.
echo Backend: http://localhost:3001/api
echo Frontend: http://localhost:5000
echo.
echo Two terminal windows will open:
echo  1. Backend Server (keep open)
echo  2. Frontend Server (keep open)
echo.
echo Wait 10 seconds, then open:
echo  http://localhost:5000
echo.
echo Press any key to exit this window...
pause >nul
