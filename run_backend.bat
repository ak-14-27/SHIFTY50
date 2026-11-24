@echo off
echo ===================================================
echo   Starting $hifty50 Backend Server (Port 5000)
echo ===================================================
cd /d "%~dp0backend"

echo Checking and installing dependencies if needed...
if not exist node_modules (
    echo Installing backend packages...
    call npm install
)

echo Ensuring .env configuration exists...
if not exist .env (
    echo DATABASE_URL="file:./dev.db" > .env
    echo PORT=5000 >> .env
    echo JWT_SECRET="shifty50_super_secure_jwt_secret_change_in_production_2026" >> .env
    echo JWT_EXPIRES_IN="7d" >> .env
    echo CORS_ORIGIN="http://localhost:5173" >> .env
)

echo Generating Prisma client...
call npx prisma generate

echo Syncing database schema...
call npx prisma db push

echo Seeding database with demo accounts...
call npm run prisma:seed

echo Starting backend development server...
call npm run dev
pause
