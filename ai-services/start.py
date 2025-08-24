#!/usr/bin/env python3
"""
Startup script for IPTER AI Services
"""
import os
import sys
import subprocess
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_dependencies():
    """Check if required dependencies are available"""
    try:
        import pytesseract
        import cv2
        import PIL
        import fastapi
        import uvicorn
        logger.info("All required dependencies are available")
        return True
    except ImportError as e:
        logger.error(f"Missing dependency: {e}")
        return False


def check_tesseract():
    """Check if Tesseract OCR is installed and accessible"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            logger.info(f"Tesseract OCR is available: {result.stdout.split()[1]}")
            return True
        else:
            logger.error("Tesseract OCR is not working properly")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        logger.error("Tesseract OCR is not installed or not in PATH")
        logger.info("Please install Tesseract OCR:")
        logger.info("  Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
        logger.info("  Linux: sudo apt-get install tesseract-ocr")
        logger.info("  macOS: brew install tesseract")
        return False


def main():
    """Main startup function"""
    logger.info("Starting IPTER AI Services...")
    
    # Check dependencies
    if not check_dependencies():
        logger.error("Dependencies check failed. Please install required packages:")
        logger.info("pip install -r requirements.txt")
        sys.exit(1)
    
    # Check Tesseract
    if not check_tesseract():
        logger.error("Tesseract OCR check failed")
        sys.exit(1)
    
    # Set environment variables
    os.environ.setdefault('HOST', '0.0.0.0')
    os.environ.setdefault('PORT', '8001')
    os.environ.setdefault('DEBUG', 'false')
    
    # Start the application
    try:
        import uvicorn
        from main import app
        
        host = os.getenv('HOST', '0.0.0.0')
        port = int(os.getenv('PORT', '8001'))
        debug = os.getenv('DEBUG', 'false').lower() == 'true'
        
        logger.info(f"Starting server on {host}:{port}")
        logger.info(f"Debug mode: {debug}")
        logger.info("API documentation will be available at: http://localhost:8001/docs")
        
        uvicorn.run(
            app,
            host=host,
            port=port,
            reload=debug,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server startup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
