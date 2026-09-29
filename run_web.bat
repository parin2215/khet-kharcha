@echo off
echo ==========================================
echo 🌾 Khet Kharcha - Web App Setup ^& Launcher
echo ==========================================
echo.
echo [1/2] Installing dependencies in web folder...
cd web
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] npm install failed. Please check your internet connection.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [2/2] Starting local web development server...
echo.
call npm run dev
pause
