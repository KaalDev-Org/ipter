@echo off
echo Starting IPTER AI Services...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Check if Tesseract is installed
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Tesseract OCR is not installed or not in PATH
    echo Please install Tesseract OCR from:
    echo https://github.com/UB-Mannheim/tesseract/wiki
    echo.
    echo The service will start but OCR functionality will not work.
    echo.
)

REM Start the service
echo Starting IPTER AI Services on http://localhost:8001
echo Press Ctrl+C to stop the service
echo.
python start.py

pause
