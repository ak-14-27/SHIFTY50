@echo off
echo ===================================================
echo   Starting $hifty50 Frontend App (Port 5173)
echo ===================================================
cd /d "%~dp0frontend"

echo Checking and installing dependencies if needed...
if not exist node_modules (
    echo Installing frontend packages...
    call npm install
)

echo Starting Vite frontend development server...
call npm run dev
pause
