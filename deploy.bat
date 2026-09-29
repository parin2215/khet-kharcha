@echo off
echo ===================================================
echo 🌾 Khet Kharcha - Build and Deploy to Firebase
echo ===================================================
echo.
echo [1/3] Installing dependencies in web folder...
cd web
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] npm install failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building production package (Vite compile)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Deploying to Firebase Hosting...
cd ..
call firebase deploy --only hosting
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Firebase deployment failed. Make sure you are logged in using 'firebase login'.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo 🎉 Deployment completed successfully!
echo ===================================================
pause
