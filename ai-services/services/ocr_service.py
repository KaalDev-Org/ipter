"""
OCR Service for IPTER AI Services
Handles text extraction from images using Tesseract OCR
"""
import pytesseract
import cv2
import numpy as np
import logging
import time
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
import re

from models.ocr_models import (
    OCRResult, ContainerNumber, BoundingBox, 
    ImageMetadata, ProcessingMetadata
)
from utils.image_utils import ImageProcessor, ContainerNumberExtractor

logger = logging.getLogger(__name__)


class OCRService:
    """OCR service for text extraction from images"""
    
    def __init__(self):
        self.image_processor = ImageProcessor()
        self.container_extractor = ContainerNumberExtractor()
        self.engine_version = self._get_tesseract_version()
        
        # OCR configuration for different scenarios
        self.ocr_configs = {
            'default': '--psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
            'container_numbers': '--psm 8 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            'single_line': '--psm 7',
            'single_word': '--psm 8',
            'digits_only': '--psm 8 -c tessedit_char_whitelist=0123456789'
        }
    
    def _get_tesseract_version(self) -> str:
        """Get Tesseract version"""
        try:
            version = pytesseract.get_tesseract_version()
            return str(version.public) if hasattr(version, 'public') else str(version)
        except Exception as e:
            logger.warning(f"Could not get Tesseract version: {e}")
            return "unknown"
    
    async def extract_text(self, image_bytes: bytes, filename: str, 
                          options: Dict[str, Any] = None) -> OCRResult:
        """
        Extract text from image using OCR
        
        Args:
            image_bytes: Image data as bytes
            filename: Original filename
            options: Processing options
        
        Returns:
            OCRResult with extracted text and metadata
        """
        start_time = time.time()
        
        try:
            logger.info(f"Starting OCR processing for {filename}")

            # Load and preprocess image
            image = self.image_processor.load_image_from_bytes(image_bytes)
            image_metadata = self.image_processor.get_image_metadata(image_bytes)
            logger.debug(f"Image loaded: {image.shape if hasattr(image, 'shape') else 'unknown shape'}")

            # Preprocess image for OCR
            processed_image, preprocessing_steps = self.image_processor.preprocess_for_ocr(
                image, options or {}
            )
            logger.debug(f"Image preprocessed with steps: {preprocessing_steps}")

            # Perform OCR
            ocr_config = self.ocr_configs.get('default', '--psm 6')
            logger.debug(f"Using OCR config: {ocr_config}")

            extracted_text = pytesseract.image_to_string(processed_image, config=ocr_config)
            logger.debug(f"Extracted text length: {len(extracted_text)} characters")

            # Get confidence scores and bounding boxes
            ocr_data = pytesseract.image_to_data(
                processed_image,
                output_type=pytesseract.Output.DICT,
                config=ocr_config
            )
            
            # Calculate overall confidence
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            overall_confidence = sum(confidences) / len(confidences) / 100.0 if confidences else 0.0
            
            # Extract bounding boxes
            bounding_boxes = self._extract_bounding_boxes(ocr_data)
            
            # Extract container numbers
            container_numbers = self._extract_container_numbers_with_positions(
                extracted_text, ocr_data
            )
            
            # Create processing metadata
            processing_time = time.time() - start_time
            processing_metadata = ProcessingMetadata(
                processing_time=processing_time,
                engine="Tesseract",
                engine_version=self.engine_version,
                preprocessing_applied=preprocessing_steps,
                timestamp=datetime.now()
            )
            
            # Create image metadata object
            img_metadata = ImageMetadata(**image_metadata) if image_metadata else None
            
            return OCRResult(
                filename=filename,
                extracted_text=extracted_text.strip(),
                container_numbers=container_numbers,
                confidence=overall_confidence,
                bounding_boxes=bounding_boxes,
                image_metadata=img_metadata,
                processing_metadata=processing_metadata,
                success=True
            )
            
        except Exception as e:
            logger.error(f"OCR processing failed for {filename}: {str(e)}")
            processing_time = time.time() - start_time
            
            processing_metadata = ProcessingMetadata(
                processing_time=processing_time,
                engine="Tesseract",
                engine_version=self.engine_version,
                preprocessing_applied=[],
                timestamp=datetime.now()
            )
            
            return OCRResult(
                filename=filename,
                extracted_text="",
                container_numbers=[],
                confidence=0.0,
                bounding_boxes=[],
                image_metadata=None,
                processing_metadata=processing_metadata,
                success=False,
                error_message=str(e)
            )
    
    async def extract_container_numbers(self, image_bytes: bytes, filename: str) -> OCRResult:
        """
        Specialized extraction for container numbers
        
        Args:
            image_bytes: Image data as bytes
            filename: Original filename
        
        Returns:
            OCRResult focused on container number extraction
        """
        start_time = time.time()
        
        try:
            # Load image
            image = self.image_processor.load_image_from_bytes(image_bytes)
            image_metadata = self.image_processor.get_image_metadata(image_bytes)
            
            # Specialized preprocessing for containers
            processed_image = self.image_processor.preprocess_for_containers(image)
            
            # Use container-specific OCR configuration
            ocr_config = self.ocr_configs['container_numbers']
            extracted_text = pytesseract.image_to_string(processed_image, config=ocr_config)
            
            # Get detailed OCR data
            ocr_data = pytesseract.image_to_data(
                processed_image,
                output_type=pytesseract.Output.DICT,
                config=ocr_config
            )
            
            # Extract container numbers with positions
            container_numbers = self._extract_container_numbers_with_positions(
                extracted_text, ocr_data
            )
            
            # Calculate confidence
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            overall_confidence = sum(confidences) / len(confidences) / 100.0 if confidences else 0.0
            
            # Processing metadata
            processing_time = time.time() - start_time
            processing_metadata = ProcessingMetadata(
                processing_time=processing_time,
                engine="Tesseract",
                engine_version=self.engine_version,
                preprocessing_applied=["container_optimized"],
                timestamp=datetime.now()
            )
            
            img_metadata = ImageMetadata(**image_metadata) if image_metadata else None
            
            return OCRResult(
                filename=filename,
                extracted_text=extracted_text.strip(),
                container_numbers=container_numbers,
                confidence=overall_confidence,
                bounding_boxes=self._extract_bounding_boxes(ocr_data),
                image_metadata=img_metadata,
                processing_metadata=processing_metadata,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Container number extraction failed for {filename}: {str(e)}")
            processing_time = time.time() - start_time
            
            processing_metadata = ProcessingMetadata(
                processing_time=processing_time,
                engine="Tesseract",
                engine_version=self.engine_version,
                preprocessing_applied=[],
                timestamp=datetime.now()
            )
            
            return OCRResult(
                filename=filename,
                extracted_text="",
                container_numbers=[],
                confidence=0.0,
                bounding_boxes=[],
                image_metadata=None,
                processing_metadata=processing_metadata,
                success=False,
                error_message=str(e)
            )
    
    def _extract_bounding_boxes(self, ocr_data: Dict) -> List[BoundingBox]:
        """Extract bounding boxes from OCR data"""
        bounding_boxes = []
        
        for i in range(len(ocr_data['text'])):
            if int(ocr_data['conf'][i]) > 30:  # Only include confident detections
                bbox = BoundingBox(
                    x=int(ocr_data['left'][i]),
                    y=int(ocr_data['top'][i]),
                    width=int(ocr_data['width'][i]),
                    height=int(ocr_data['height'][i]),
                    confidence=int(ocr_data['conf'][i]) / 100.0
                )
                bounding_boxes.append(bbox)
        
        return bounding_boxes
    
    def _extract_container_numbers_with_positions(self, text: str, 
                                                 ocr_data: Dict) -> List[ContainerNumber]:
        """Extract container numbers and try to find their positions"""
        # First extract container numbers from text
        container_numbers_text = self.container_extractor.extract_container_numbers(text)
        
        container_numbers = []
        for number in container_numbers_text:
            # Try to find the position of this number in the OCR data
            bounding_box = self._find_text_position(number, ocr_data)
            
            container_number = ContainerNumber(
                number=number,
                confidence=0.8,  # Default confidence, could be improved
                bounding_box=bounding_box,
                validation_status="pending"
            )
            container_numbers.append(container_number)
        
        return container_numbers
    
    def _find_text_position(self, target_text: str, ocr_data: Dict) -> Optional[BoundingBox]:
        """Find the position of specific text in OCR data"""
        target_text = target_text.upper().replace(' ', '')
        
        # Look for the text in OCR results
        for i, detected_text in enumerate(ocr_data['text']):
            if detected_text and target_text in detected_text.upper().replace(' ', ''):
                return BoundingBox(
                    x=int(ocr_data['left'][i]),
                    y=int(ocr_data['top'][i]),
                    width=int(ocr_data['width'][i]),
                    height=int(ocr_data['height'][i]),
                    confidence=int(ocr_data['conf'][i]) / 100.0
                )
        
        return None
