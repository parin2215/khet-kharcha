@echo off
echo ============================================
echo 📱 Khet Kharcha - Mobile App Setup ^& Launcher
echo ============================================
echo.
echo [1/2] Installing dependencies in mobile folder...
cd mobile
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] npm install failed. Please check your internet connection.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [2/2] Starting Expo development server...
echo.
call npx expo start
pause
