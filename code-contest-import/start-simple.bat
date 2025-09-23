@echo off
echo Starting CodeContest Pro...
echo.

echo [1/2] Starting Backend Server (Port 3001)...
start "Backend" cmd /k "cd backend && npm start"

echo [2/2] Waiting 3 seconds then starting Frontend (Port 5000)...
timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "npm run dev:local"

echo.
echo ✅ Both services are starting!
echo.
echo Frontend: http://localhost:5000
echo Backend:  http://localhost:3001/api
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5000