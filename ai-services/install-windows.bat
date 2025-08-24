@echo off
echo Installing IPTER AI Services on Windows...
echo.

REM Check if we're in a virtual environment
if not defined VIRTUAL_ENV (
    echo ERROR: Please activate your virtual environment first
    echo Run: venv\Scripts\activate
    pause
    exit /b 1
)

echo Step 1: Upgrading pip...
python -m pip install --upgrade pip
if errorlevel 1 (
    echo ERROR: Failed to upgrade pip
    pause
    exit /b 1
)

echo.
echo Step 2: Installing core dependencies...
pip install wheel setuptools
if errorlevel 1 (
    echo ERROR: Failed to install wheel and setuptools
    pause
    exit /b 1
)

echo.
echo Step 3: Installing FastAPI and server dependencies...
pip install fastapi==0.104.1
pip install "uvicorn[standard]==0.24.0"
pip install python-multipart==0.0.6
if errorlevel 1 (
    echo ERROR: Failed to install FastAPI dependencies
    pause
    exit /b 1
)

echo.
echo Step 4: Installing NumPy (required for image processing)...
pip install numpy==1.24.3
if errorlevel 1 (
    echo ERROR: Failed to install NumPy
    pause
    exit /b 1
)

echo.
echo Step 5: Installing Pillow (image processing)...
pip install pillow==9.5.0
if errorlevel 1 (
    echo ERROR: Failed to install Pillow
    echo Trying alternative version...
    pip install pillow
    if errorlevel 1 (
        echo ERROR: Failed to install Pillow completely
        pause
        exit /b 1
    )
)

echo.
echo Step 6: Installing OpenCV...
pip install opencv-python==4.8.1.78
if errorlevel 1 (
    echo ERROR: Failed to install OpenCV
    echo Trying headless version...
    pip install opencv-python-headless
    if errorlevel 1 (
        echo ERROR: Failed to install OpenCV completely
        pause
        exit /b 1
    )
)

echo.
echo Step 7: Installing Tesseract Python wrapper...
pip install pytesseract==0.3.10
if errorlevel 1 (
    echo ERROR: Failed to install pytesseract
    pause
    exit /b 1
)

echo.
echo Step 8: Installing remaining dependencies...
pip install pydantic==2.5.0
pip install requests==2.31.0
pip install python-dotenv==1.0.0
if errorlevel 1 (
    echo ERROR: Failed to install remaining dependencies
    pause
    exit /b 1
)

echo.
echo Step 9: Verifying installation...
python -c "import fastapi, uvicorn, PIL, cv2, pytesseract, numpy; print('All packages imported successfully!')"
if errorlevel 1 (
    echo WARNING: Some packages may not be working correctly
    echo But installation completed. Try running the service.
) else (
    echo SUCCESS: All packages installed and verified!
)

echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Make sure Tesseract OCR is installed on your system
echo 2. Run: python start.py
echo.
pause
