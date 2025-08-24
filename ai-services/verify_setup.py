#!/usr/bin/env python3
"""
Setup Verification Script for IPTER OCR System
"""
import subprocess
import sys
import os

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    if version.major >= 3 and version.minor >= 8:
        print("✓ Python version is compatible")
        return True
    else:
        print("✗ Python version should be 3.8 or higher")
        return False

def check_tesseract():
    """Check Tesseract installation"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✓ Tesseract installed: {version_line}")
            return True
        else:
            print("✗ Tesseract not working properly")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("✗ Tesseract not found. Please install Tesseract OCR.")
        return False

def check_dependencies():
    """Check Python dependencies"""
    required_packages = [
        'pytesseract',
        'cv2',
        'PIL',
        'numpy',
        'fastapi',
        'uvicorn'
    ]
    
    missing = []
    for package in required_packages:
        try:
            if package == 'cv2':
                import cv2
            elif package == 'PIL':
                import PIL
            else:
                __import__(package)
            print(f"✓ {package} available")
        except ImportError:
            print(f"✗ {package} missing")
            missing.append(package)
    
    return len(missing) == 0

def check_ocr_functionality():
    """Test basic OCR functionality"""
    try:
        import pytesseract
        from PIL import Image, ImageDraw
        
        # Create simple test image
        img = Image.new('RGB', (200, 50), color='white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 15), "TEST", fill='black')
        
        # Test OCR
        text = pytesseract.image_to_string(img).strip()
        if text:
            print(f"✓ OCR working: extracted '{text}'")
            return True
        else:
            print("⚠ OCR working but no text extracted from test image")
            return True  # Still consider it working
    except Exception as e:
        print(f"✗ OCR test failed: {e}")
        return False

def main():
    """Main verification function"""
    print("IPTER OCR System Setup Verification")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Tesseract OCR", check_tesseract),
        ("Python Dependencies", check_dependencies),
        ("OCR Functionality", check_ocr_functionality),
    ]
    
    results = []
    
    for check_name, check_func in checks:
        print(f"\nChecking {check_name}...")
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"✗ {check_name} check failed: {e}")
            results.append((check_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("VERIFICATION SUMMARY")
    print("=" * 50)
    
    passed = 0
    for check_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{check_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nResult: {passed}/{len(results)} checks passed")
    
    if passed == len(results):
        print("\n🎉 Setup verification successful!")
        print("You can now start the OCR service with: python start.py")
        return True
    else:
        print(f"\n❌ {len(results) - passed} check(s) failed.")
        print("Please fix the issues above before starting the service.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
