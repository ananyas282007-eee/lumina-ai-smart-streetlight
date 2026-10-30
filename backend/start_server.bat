@echo off
title LUMINA AI – Backend Server
echo ============================================================
echo   LUMINA AI – AI-Based Smart Streetlight Energy System
echo   Backend Server Startup Script
echo ============================================================
echo.
echo [1/3] Activating virtual environment...
call "%~dp0venv\Scripts\activate.bat"
if errorlevel 1 (
  echo ERROR: Could not activate virtual environment.
  echo Run setup.bat first.
  pause
  exit /b 1
)
echo.
echo [2/3] Training AI model (if not already trained)...
python train.py
echo.
echo [3/3] Starting FastAPI server on http://localhost:8000
echo       API docs: http://localhost:8000/docs
echo       Press Ctrl+C to stop.
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
