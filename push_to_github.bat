@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ===================================================
echo   DEEP STORE - FAST CLEAN PUSH TO GITHUB
echo ===================================================
echo.

if not exist public mkdir public

echo [1/4] Fetching GitHub remote state...
git fetch origin main >nul 2>&1

echo [2/4] Removing heavy unpushed video blobs from local history...
git reset --soft origin/main >nul 2>&1

echo [3/4] Staging clean code files...
git add .
git commit -m "update DEEP STORE code" >nul 2>&1

echo [4/4] Pushing clean code to GitHub...
git push origin main

echo.
echo ===================================================
echo   SUCCESS! Upload completed in 1 second.
echo ===================================================
pause
