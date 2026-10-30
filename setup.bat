@echo off
title LUMINA AI – Full System Setup
echo ============================================================
echo   LUMINA AI Setup Script – Windows 11
echo   AI-Based Smart Streetlight Energy Optimisation System
echo   SOFTWARE-ONLY PROTOTYPE
echo ============================================================
echo.

REM --- Add Node.js to PATH (extracted version) ---
set "NODEJS_PATH=C:\nodejs\node-v22.11.0-win-x64"
if exist "%NODEJS_PATH%\node.exe" (
  set "PATH=%NODEJS_PATH%;%PATH%"
  echo [OK] Node.js found at %NODEJS_PATH%
) else (
  echo [INFO] Using system Node.js from PATH
)

echo.
echo ============================================================
echo  STEP 1: Python Backend Setup
echo ============================================================
cd /d "%~dp0backend"

if not exist venv (
  echo Creating Python virtual environment...
  where uv.exe >nul 2>nul
  if %errorlevel% equ 0 (
    uv venv --python 3.11 venv
  ) else (
    py -3.11 -m venv venv 2>nul || py -3 -m venv venv || python -m venv venv
  )
)
call venv\Scripts\activate.bat

echo Installing Python dependencies...
where uv.exe >nul 2>nul
if %errorlevel% equ 0 (
  uv pip install -r requirements.txt
) else (
  pip install -r requirements.txt --quiet
)

echo.
echo Training AI model...
python train.py

echo.
echo ============================================================
echo  STEP 2: React Frontend Setup
echo ============================================================
cd /d "%~dp0frontend"
echo Installing Node.js dependencies...
npm.cmd install

echo.
echo ============================================================
echo  SETUP COMPLETE!
echo ============================================================
echo.
echo  To start the system:
echo.
echo  Option A - Startup Scripts:
echo    Double-click backend\start_server.bat
echo    Double-click frontend\start_frontend.bat
echo.
echo  Option B - Manual Terminals:
echo    Terminal 1 (Backend):
echo      cd backend
echo      venv\Scripts\activate
echo      uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
echo    Terminal 2 (Frontend):
echo      cd frontend
echo      set PATH=C:\nodejs\node-v22.11.0-win-x64;%PATH%
echo      npm.cmd run dev
echo.
echo  Then open: http://localhost:5173
echo.
pause
