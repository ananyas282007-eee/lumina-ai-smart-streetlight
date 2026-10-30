@echo off
title LUMINA AI – Frontend Dev Server
echo ============================================================
echo   LUMINA AI – Frontend Dashboard (React + Vite)
echo ============================================================
echo.
echo [1/2] Installing Node.js dependencies...
set PATH=C:\nodejs\node-v22.11.0-win-x64;%PATH%
call npm.cmd install
if errorlevel 1 (
  echo ERROR: npm install failed.
  pause
  exit /b 1
)
echo.
echo [2/2] Starting React dev server on http://localhost:5173
echo       Dashboard: http://localhost:5173
echo       Press Ctrl+C to stop.
echo.
call npm.cmd run dev
pause
