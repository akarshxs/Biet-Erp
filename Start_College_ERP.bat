@echo off
title BIET ERP Launcher
set "PROJECT_DIR=%~dp0"

echo ========================================
echo          BIET ERP STARTING...
echo ========================================
echo.

echo Starting Backend API on port 8080...
start "BIET ERP - Backend" cmd /k "cd /d "%PROJECT_DIR%" && set PORT=8080 && set NODE_ENV=development && corepack.cmd pnpm --filter @workspace/api-server start"

timeout /t 3 /nobreak >nul

echo Starting Frontend on port 5173...
start "BIET ERP - Frontend" cmd /k "cd /d "%PROJECT_DIR%" && set PORT=5173 && set BASE_PATH=/ && corepack.cmd pnpm --filter @workspace/college-erp dev"

echo Waiting for the frontend...
timeout /t 7 /nobreak >nul

echo Opening BIET ERP...
start "" "http://localhost:5173/"

echo.
echo BIET ERP is starting.
echo Keep the Backend and Frontend windows open while using the ERP.
echo.
timeout /t 3 /nobreak >nul
exit
