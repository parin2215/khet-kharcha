@echo off
echo ==========================================
echo 🌱 Khet Kharcha - Seed Test Data
echo ==========================================
echo.
set /p UID_INPUT="Please enter your Firebase Test User UID: "
if "%UID_INPUT%"=="" (
    echo [ERROR] UID cannot be empty.
    pause
    exit /b 1
)
echo.
echo Seeding data for User UID: %UID_INPUT% ...
node firebase/seed.js %UID_INPUT%
pause
