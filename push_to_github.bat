@echo off
chcp 65001 >nul
echo ===================================================
echo   DEEP STORE - PUSHING TO GITHUB (AUTOMATED SCRIPT)
echo ===================================================
echo.

:: Ensure we are in the correct directory
cd /d "%~dp0"

:: Create public directory and copy logo and banner assets
if not exist public mkdir public
node copy_intro.js >nul 2>&1
copy /y "%~dp0logo\12-removebg-preview.png" "%~dp0public\logo.png" >nul
copy /y "%~dp0logo\baner.png" "%~dp0public\banner.png" >nul
copy /y "%~dp0logo\Screenshot 2026-07-23 041712.png" "%~dp0public\banner_light.png" >nul
copy /y "%~dp0logo\*انترو*.png" "%~dp0public\intro.png" >nul
if not exist "%~dp0public\intro.png" copy /y "%~dp0logo\انترو 1.png" "%~dp0public\intro.png" >nul
if not exist "%~dp0public\intro.png" copy /y "%~dp0public\logo.png" "%~dp0public\intro.png" >nul

:: Initialize Git if not already done
if not exist .git (
    echo [1/5] Initializing Git repository...
    git init
) else (
    echo [1/5] Git repository already initialized.
)

:: Add all files
echo [2/5] Adding all files to Git...
git add .

:: Commit
echo [3/5] Creating commit...
git commit -m "feat: complete DEEP STORE rebrand, firebase migration, and Gemini AI chatbot"

:: Set branch to main
echo [4/5] Setting main branch...
git branch -M main

:: Remove remote if it exists and add the correct remote
git remote remove origin >nul 2>&1
echo [5/5] Linking to GitHub repository...
git remote add origin https://github.com/storedeeb2020-dot/deebstore.git

:: Push
echo.
echo ===================================================
echo   PUSHING TO GITHUB...
echo ===================================================
git push -u origin main --force

echo.
echo Done! Please check your repository at https://github.com/storedeeb2020-dot/deebstore.git
pause
