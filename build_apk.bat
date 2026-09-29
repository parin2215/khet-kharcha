@echo off
echo ====================================================
echo 📱 Khet Kharcha - Android APK Build Tool
echo ====================================================
echo.

:: 1. Skip EAS CLI installation if already present
where eas >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [1/2] EAS CLI is already installed. Skipping installation...
) else (
    echo [1/2] EAS CLI not found. Installing globally...
    call npm install -g eas-cli
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERROR] Failed to install eas-cli globally. Make sure Node.js is installed.
        pause
        exit /b %ERRORLEVEL%
    )
)

echo.
echo [2/2] Choose build method:
echo [1] Local Build (Extremely FAST, compiles on your PC, requires Android SDK + Java)
echo [2] Cloud Build (Slow, queues on Expo servers, takes 5-15 mins)
echo.
set /p choice="Enter your choice (1 or 2): "

cd mobile

:: Auto-run crop logo script to prepare assets
echo [INFO] Running crop_logo.js to prepare assets...
node ..\crop_logo.js

if "%choice%"=="1" goto LOCAL_BUILD
goto CLOUD_BUILD

:LOCAL_BUILD
echo.
echo Starting Fast Local APK Build (via native Gradle)...
echo Speed optimization: Building only for arm64-v8a (modern phones) and skipping PNG compression...

:: Clean up corrupted/empty local.properties from previous run
if exist "android\local.properties" (
    for %%I in (android\local.properties) do (
        if %%~zI lss 20 del /q "android\local.properties"
    )
)

if exist "android\local.properties" goto RUN_GRADLE
if not exist "%LOCALAPPDATA%\Android\Sdk" goto RUN_GRADLE

echo [INFO] Auto-configuring Android SDK path in local.properties...
set "SDK_DIR=%LOCALAPPDATA:\=/%/Android/Sdk"
echo sdk.dir=%SDK_DIR%> "android\local.properties"

:RUN_GRADLE
cd android
call gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a -Pandroid.enablePngCrunchInReleaseBuilds=false
set "BUILD_STATUS=%ERRORLEVEL%"
cd ..
cd ..
set "APK_PATH=mobile\android\app\build\outputs\apk\release\app-release.apk"
goto AFTER_BUILD

:CLOUD_BUILD
echo.
echo Starting Cloud APK Build (please wait for free tier queue)...
cmd /c eas build -p android --profile preview
set "BUILD_STATUS=%ERRORLEVEL%"
cd ..
set "APK_PATH=Cloud Link (see EAS build output above)"
goto AFTER_BUILD

:AFTER_BUILD
if %BUILD_STATUS% neq 0 (
    echo.
    echo [ERROR] Build failed. Check the errors above.
    echo.
    echo If you chose Local Build [1] and got 'SDK location not found':
    echo Please make sure Android Studio is installed and its Android SDK is set up,
    echo or set the ANDROID_HOME environment variable to your SDK folder.
    pause
    exit /b %BUILD_STATUS%
)

echo.
echo ====================================================
echo 🎉 Build completed successfully!
echo.
if "%choice%"=="1" (
    echo Your local APK file is compiled and ready at:
    echo %APK_PATH%
    echo.
    echo Copy this APK file to your phone to install it.
) else (
    echo Open the EAS cloud link or scan the QR code above to download.
)
echo ====================================================
pause
