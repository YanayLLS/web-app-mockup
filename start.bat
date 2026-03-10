@echo off
title Dev Server - Designs
cd /d "%~dp0"

echo Killing any existing dev servers on port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo   Killing PID %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo Starting dev server...
npm run dev
