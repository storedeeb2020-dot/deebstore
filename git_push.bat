@echo off
chcp 65001 > nul
echo ====================================
echo 🤖 ELDEEB STORE — GitHub Auto Push
echo ====================================
node git_bot.js %*
pause
