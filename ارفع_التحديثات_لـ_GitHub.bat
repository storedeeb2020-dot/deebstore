@echo off
set PATH=%SystemRoot%\system32;%SystemRoot%;%PATH%
title GitHub Sync — ELDEEB STORE

echo.
echo 🚀 جاري رفع التحديثات إلى GitHub...
echo.

git init
git remote add origin https://github.com/storedeeb2020-dot/deebstore.git 2>nul
git remote set-url origin https://github.com/storedeeb2020-dot/deebstore.git

git add .
git commit -m "تحديث المتجر"
git branch -M main
git push -u origin main

echo.
echo ✅ تم الرفع بنجاح!
pause
