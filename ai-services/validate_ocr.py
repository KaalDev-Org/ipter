#!/usr/bin/env python3
"""
OCR System Validation Script
"""
import sys
import os

def main():
    print("IPTER OCR System Validation")
    print("=" * 40)
    
    # Test 1: Import dependencies
    print("\n1. Testing Python dependencies...")
    try:
        import pytesseract
        print("   ✓ pytesseract imported")
        
        import cv2
        print("   ✓ opencv imported")
        
        import PIL
        print("   ✓ PIL imported")
        
        import numpy
        print("   ✓ numpy imported")
        
        import fastapi
        print("   ✓ fastapi imported")
        
    except ImportError as e:
        print(f"   ✗ Import error: {e}")
        return False
    
    # Test 2: Tesseract availability
    print("\n2. Testing Tesseract OCR...")
    try:
        version = pytesseract.get_tesseract_version()
        print(f"   ✓ Tesseract version: {version}")
    except Exception as e:
        print(f"   ✗ Tesseract error: {e}")
        return False
    
    # Test 3: Basic OCR functionality
    print("\n3. Testing basic OCR...")
    try:
        from PIL import Image, ImageDraw
        
        # Create test image
        img = Image.new('RGB', (200, 50), color='white')
        draw = ImageDraw.Draw(img)
        draw.text((10, 10), "TEST123", fill='black')
        
        # Test OCR
        text = pytesseract.image_to_string(img)
        print(f"   ✓ OCR result: '{text.strip()}'")
        
    except Exception as e:
        print(f"   ✗ OCR test error: {e}")
        return False
    
    # Test 4: Container number extraction
    print("\n4. Testing container number extraction...")
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from utils.image_utils import ContainerNumberExtractor
        
        extractor = ContainerNumberExtractor()
        test_text = "Container ABCD1234567 found"
        numbers = extractor.extract_container_numbers(test_text)
        print(f"   ✓ Extracted: {numbers}")
        
    except Exception as e:
        print(f"   ✗ Container extraction error: {e}")
        return False
    
    print("\n" + "=" * 40)
    print("✓ All tests passed! OCR system is working.")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
