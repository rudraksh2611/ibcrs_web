@echo off
REM IBCRS - Start Script
REM This script sets up and runs the IBCRS backend server

setlocal enabledelayedexpansion

echo.
echo ============================================
echo  IBCRS - Intelligent Biometric and Crop
echo         Recognition System
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Created successfully!
)

REM Activate virtual environment
echo [2/3] Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)
echo Activated successfully!

REM Install dependencies
echo [3/3] Installing dependencies...
pip install -q -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed!

REM Start the application
echo.
echo ============================================
echo Starting IBCRS Server...
echo ============================================
echo.
echo Server will run on: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python backend\app.py

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server failed to start
    pause
    exit /b 1
)

pause
