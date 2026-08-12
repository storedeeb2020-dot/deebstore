@echo off
cd /d "%~dp0"
echo ===================================================
echo   EXACT 4 FILES DIAGNOSTIC REPORT
echo ===================================================
echo.
echo The 4 files that were being copied and modified on every script run:
echo 1. public/logo.png
echo 2. public/banner.png
echo 3. public/banner_light.png
echo 4. public/intro.png
echo.
echo Checking Git status of public directory right now:
git status --short public/
echo.
echo Done! Now these 4 files will NOT be re-copied or re-uploaded unnecessarily.
pause
