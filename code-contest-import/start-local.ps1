Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CodeContest Pro - Local Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Installing dependencies..." -ForegroundColor Yellow
Write-Host "Installing frontend dependencies..." -ForegroundColor White
try {
    npm install
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing backend dependencies..." -ForegroundColor White
try {
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[3/4] Starting services..." -ForegroundColor Yellow

# Start backend in new PowerShell window
Write-Host "Starting backend server on port 3001..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm start"

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor White
Start-Sleep -Seconds 3

# Start frontend in new PowerShell window
Write-Host "Starting frontend server on port 5000..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host ""
Write-Host "[4/4] Services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CodeContest Pro is now running!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001/api" -ForegroundColor Green
Write-Host ""
Write-Host "Opening application in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5000"

Write-Host ""
Write-Host "To stop the services, close both PowerShell windows" -ForegroundColor Yellow
Write-Host "or press Ctrl+C in each window" -ForegroundColor Yellow
Read-Host "Press Enter to continue"