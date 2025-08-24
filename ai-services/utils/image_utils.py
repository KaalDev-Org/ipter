"""
Image processing utilities for IPTER AI services
"""
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import io
import logging
from typing import Tuple, Optional, List
import re

logger = logging.getLogger(__name__)


class ImageProcessor:
    """Image preprocessing utilities for better OCR results"""
    
    def __init__(self):
        self.supported_formats = ['JPEG', 'PNG', 'TIFF', 'BMP']
    
    def load_image_from_bytes(self, image_bytes: bytes) -> np.ndarray:
        """Load image from bytes into OpenCV format"""
        try:
            # Convert bytes to PIL Image
            pil_image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            # Convert PIL to OpenCV format
            opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            return opencv_image
        except Exception as e:
            logger.error(f"Error loading image from bytes: {str(e)}")
            raise ValueError(f"Invalid image data: {str(e)}")
    
    def get_image_metadata(self, image_bytes: bytes) -> dict:
        """Extract image metadata"""
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
            return {
                'width': pil_image.width,
                'height': pil_image.height,
                'channels': len(pil_image.getbands()),
                'format': pil_image.format,
                'file_size': len(image_bytes),
                'color_space': pil_image.mode
            }
        except Exception as e:
            logger.error(f"Error extracting image metadata: {str(e)}")
            return {}
    
    def preprocess_for_ocr(self, image: np.ndarray, options: dict = None) -> np.ndarray:
        """
        Preprocess image for better OCR results
        
        Args:
            image: Input image in OpenCV format
            options: Preprocessing options
        
        Returns:
            Preprocessed image
        """
        if options is None:
            options = {}
        
        processed = image.copy()
        applied_steps = []
        
        try:
            # Convert to grayscale
            if len(processed.shape) == 3:
                processed = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
                applied_steps.append("grayscale")
            
            # Resize if image is too small or too large
            height, width = processed.shape[:2]
            if width < 300 or height < 300:
                scale_factor = max(300/width, 300/height)
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                processed = cv2.resize(processed, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
                applied_steps.append(f"upscale_{scale_factor:.2f}")
            elif width > 3000 or height > 3000:
                scale_factor = min(3000/width, 3000/height)
                new_width = int(width * scale_factor)
                new_height = int(height * scale_factor)
                processed = cv2.resize(processed, (new_width, new_height), interpolation=cv2.INTER_AREA)
                applied_steps.append(f"downscale_{scale_factor:.2f}")
            
            # Noise reduction
            if options.get('denoise', True):
                processed = cv2.fastNlMeansDenoising(processed)
                applied_steps.append("denoise")
            
            # Enhance contrast
            if options.get('enhance_contrast', True):
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
                processed = clahe.apply(processed)
                applied_steps.append("clahe")
            
            # Sharpen image
            if options.get('sharpen', True):
                kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
                processed = cv2.filter2D(processed, -1, kernel)
                applied_steps.append("sharpen")
            
            # Threshold for better text detection
            if options.get('threshold', True):
                # Use adaptive threshold for varying lighting conditions
                processed = cv2.adaptiveThreshold(
                    processed, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                    cv2.THRESH_BINARY, 11, 2
                )
                applied_steps.append("adaptive_threshold")
            
            logger.info(f"Applied preprocessing steps: {applied_steps}")
            return processed, applied_steps
            
        except Exception as e:
            logger.error(f"Error in image preprocessing: {str(e)}")
            return image, []
    
    def preprocess_for_containers(self, image: np.ndarray) -> np.ndarray:
        """
        Specialized preprocessing for container number detection
        
        Args:
            image: Input image in OpenCV format
        
        Returns:
            Preprocessed image optimized for container numbers
        """
        try:
            processed = image.copy()
            
            # Convert to grayscale
            if len(processed.shape) == 3:
                processed = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
            
            # Enhance contrast specifically for white containers with dark text
            processed = cv2.equalizeHist(processed)
            
            # Morphological operations to clean up text
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 1))
            processed = cv2.morphologyEx(processed, cv2.MORPH_CLOSE, kernel)
            
            # Binary threshold - containers typically have high contrast
            _, processed = cv2.threshold(processed, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            return processed
            
        except Exception as e:
            logger.error(f"Error in container preprocessing: {str(e)}")
            return image


class ContainerNumberExtractor:
    """Extract and validate container numbers from text"""
    
    def __init__(self):
        # Common container number patterns
        self.patterns = [
            # Standard container number format: 4 letters + 7 digits
            r'\b[A-Z]{4}\s*\d{7}\b',
            # With check digit: 4 letters + 6 digits + 1 check digit
            r'\b[A-Z]{4}\s*\d{6}\s*\d\b',
            # Variations with separators
            r'\b[A-Z]{4}[-\s]*\d{3}[-\s]*\d{3}[-\s]*\d\b',
            # More flexible pattern for OCR errors
            r'\b[A-Z0-9]{4}[-\s]*\d{6,7}\b'
        ]
    
    def extract_container_numbers(self, text: str) -> List[str]:
        """
        Extract container numbers from text using regex patterns
        
        Args:
            text: Input text from OCR
        
        Returns:
            List of potential container numbers
        """
        container_numbers = []
        
        # Clean up text
        cleaned_text = re.sub(r'[^\w\s-]', ' ', text.upper())
        
        for pattern in self.patterns:
            matches = re.findall(pattern, cleaned_text)
            for match in matches:
                # Clean up the match
                clean_number = re.sub(r'[-\s]+', '', match)
                if self.validate_container_number(clean_number):
                    container_numbers.append(clean_number)
        
        # Remove duplicates while preserving order
        return list(dict.fromkeys(container_numbers))
    
    def validate_container_number(self, number: str) -> bool:
        """
        Basic validation for container numbers

        Args:
            number: Container number to validate

        Returns:
            True if number appears to be a valid container number
        """
        if not number or len(number) < 10:
            return False

        # Clean the number (remove spaces, convert to uppercase)
        clean_number = number.upper().replace(' ', '').replace('-', '')

        # Check basic format: 4 letters followed by 6-7 digits
        if not re.match(r'^[A-Z]{4}\d{6,7}$', clean_number):
            return False

        # Additional validation could include check digit verification
        # For now, we'll accept numbers that match the basic pattern
        return True
    
    def calculate_check_digit(self, container_number: str) -> int:
        """
        Calculate check digit for container number validation
        (ISO 6346 standard)
        
        Args:
            container_number: Container number without check digit
        
        Returns:
            Check digit (0-9)
        """
        if len(container_number) != 10:
            return -1
        
        # Character to number mapping for letters
        char_values = {
            'A': 10, 'B': 12, 'C': 13, 'D': 14, 'E': 15, 'F': 16, 'G': 17,
            'H': 18, 'I': 19, 'J': 20, 'K': 21, 'L': 23, 'M': 24, 'N': 25,
            'O': 26, 'P': 27, 'Q': 28, 'R': 29, 'S': 30, 'T': 31, 'U': 32,
            'V': 34, 'W': 35, 'X': 36, 'Y': 37, 'Z': 38
        }
        
        total = 0
        for i, char in enumerate(container_number):
            if char.isalpha():
                value = char_values.get(char, 0)
            else:
                value = int(char)
            
            total += value * (2 ** i)
        
        return (total % 11) % 10
