@echo off
title CodeContest Pro - Complete Setup
color 0A

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║     CodeContest Pro - Complete Setup         ║
echo  ║        Database Seeding + Server Start       ║
echo  ╚══════════════════════════════════════════════╝
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
echo [STEP 2] Database Seeding...
echo This will populate the database with 200+ problems and sample data.
echo.
set /p seed_choice="Do you want to seed the database? (y/n): "

if /i "%seed_choice%"=="y" (
    echo 🌱 Starting database seeding...
    cd backend
    call npm run seed
    if errorlevel 1 (
        echo ❌ Database seeding failed
        echo You can continue without seeding or fix the database connection
        set /p continue_choice="Continue anyway? (y/n): "
        if /i not "%continue_choice%"=="y" (
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Database seeding completed successfully!
    )
    cd ..
) else (
    echo ⏭️  Skipping database seeding
)

echo.
echo [STEP 3] Starting Services...
echo Starting backend server on port 3001...
start "CodeContest Backend" cmd /c "cd backend && npm start && pause"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo Starting frontend server on port 5000...
start "CodeContest Frontend" cmd /c "npm run dev:local && pause"

echo.
echo ✅ Services are starting!
echo.
echo 📡 Backend:  http://localhost:3001/api
echo 🌐 Frontend: http://localhost:5000
echo.
echo 🔑 Admin Login (if database was seeded):
echo    Email: admin@codecontest.com
echo    Password: admin123
echo.
echo Waiting 10 seconds then opening browser...
timeout /t 10 /nobreak >nul

start http://localhost:5000

echo.
echo 🎉 CodeContest Pro is now running!
echo.
echo 📊 Features Available:
echo    ✅ 200+ Programming Problems
echo    ✅ Real-time Code Execution
echo    ✅ Plagiarism Detection
echo    ✅ Live Leaderboards
echo    ✅ Activity Logging
echo    ✅ Contest Management
echo.
echo To stop the services:
echo - Close both terminal windows
echo - Or press Ctrl+C in each window
echo.
echo If you encounter issues, check TROUBLESHOOTING.md
echo.
pause