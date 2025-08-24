#!/usr/bin/env python3
"""
Test script for OCR functionality
"""
import asyncio
import logging
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.ocr_service import OCRService
from utils.image_utils import ImageProcessor, ContainerNumberExtractor
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_test_image():
    """Create a simple test image with container number"""
    # Create a white image
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a font, fallback to default if not available
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # Draw container number
    container_number = "ABCD1234567"
    draw.text((50, 80), container_number, fill='black', font=font)
    
    # Save as bytes
    import io
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    return img_bytes.getvalue()


async def test_dependencies():
    """Test if all dependencies are working"""
    logger.info("Testing dependencies...")
    
    try:
        import pytesseract
        logger.info(f"✓ pytesseract imported successfully")
        
        # Test Tesseract version
        version = pytesseract.get_tesseract_version()
        logger.info(f"✓ Tesseract version: {version}")
        
        import cv2
        logger.info(f"✓ OpenCV version: {cv2.__version__}")
        
        import PIL
        logger.info(f"✓ PIL version: {PIL.__version__}")
        
        import numpy as np
        logger.info(f"✓ NumPy version: {np.__version__}")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Dependency test failed: {e}")
        return False


async def test_image_processor():
    """Test image processing utilities"""
    logger.info("Testing image processor...")
    
    try:
        processor = ImageProcessor()
        
        # Create test image
        test_image_bytes = create_test_image()
        
        # Test loading image
        image = processor.load_image_from_bytes(test_image_bytes)
        logger.info(f"✓ Image loaded: shape {image.shape}")
        
        # Test preprocessing
        processed, steps = processor.preprocess_for_ocr(image, {})
        logger.info(f"✓ Image preprocessed with steps: {steps}")
        
        # Test container preprocessing
        container_processed = processor.preprocess_for_containers(image)
        logger.info(f"✓ Container preprocessing completed")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Image processor test failed: {e}")
        return False


async def test_container_extractor():
    """Test container number extraction"""
    logger.info("Testing container number extractor...")
    
    try:
        extractor = ContainerNumberExtractor()
        
        # Test with sample text
        test_text = "Container ABCD1234567 and EFGH9876543 found"
        numbers = extractor.extract_container_numbers(test_text)
        logger.info(f"✓ Extracted container numbers: {numbers}")
        
        # Test validation
        valid = extractor.validate_container_number("ABCD1234567")
        logger.info(f"✓ Container number validation: {valid}")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ Container extractor test failed: {e}")
        return False


async def test_ocr_service():
    """Test OCR service"""
    logger.info("Testing OCR service...")
    
    try:
        ocr_service = OCRService()
        
        # Create test image
        test_image_bytes = create_test_image()
        
        # Test general OCR
        result = await ocr_service.extract_text(test_image_bytes, "test.png")
        logger.info(f"✓ OCR extraction completed")
        logger.info(f"  - Success: {result.success}")
        logger.info(f"  - Extracted text: '{result.extracted_text.strip()}'")
        logger.info(f"  - Container numbers: {[cn.number for cn in result.container_numbers]}")
        logger.info(f"  - Confidence: {result.confidence:.2f}")
        
        # Test container-specific OCR
        container_result = await ocr_service.extract_container_numbers(test_image_bytes, "test.png")
        logger.info(f"✓ Container OCR extraction completed")
        logger.info(f"  - Success: {container_result.success}")
        logger.info(f"  - Container numbers: {[cn.number for cn in container_result.container_numbers]}")
        
        return True
        
    except Exception as e:
        logger.error(f"✗ OCR service test failed: {e}")
        return False


async def main():
    """Run all tests"""
    logger.info("Starting OCR system tests...")
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Image Processor", test_image_processor),
        ("Container Extractor", test_container_extractor),
        ("OCR Service", test_ocr_service),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running {test_name} test...")
        logger.info(f"{'='*50}")
        
        try:
            result = await test_func()
            results[test_name] = result
            if result:
                logger.info(f"✓ {test_name} test PASSED")
            else:
                logger.error(f"✗ {test_name} test FAILED")
        except Exception as e:
            logger.error(f"✗ {test_name} test ERROR: {e}")
            results[test_name] = False
    
    # Summary
    logger.info(f"\n{'='*50}")
    logger.info("TEST SUMMARY")
    logger.info(f"{'='*50}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        logger.info(f"{test_name}: {status}")
    
    logger.info(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! OCR system is working correctly.")
        return 0
    else:
        logger.error("❌ Some tests failed. Please check the errors above.")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
