"""
Pydantic models for OCR and image processing services
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class BoundingBox(BaseModel):
    """Bounding box coordinates for detected text"""
    x: int = Field(..., description="X coordinate of top-left corner")
    y: int = Field(..., description="Y coordinate of top-left corner")
    width: int = Field(..., description="Width of bounding box")
    height: int = Field(..., description="Height of bounding box")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score for this detection")


class ContainerNumber(BaseModel):
    """Container number with metadata"""
    number: str = Field(..., description="Extracted container number")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")
    bounding_box: Optional[BoundingBox] = Field(None, description="Location of the number in image")
    validation_status: str = Field(default="pending", description="Validation status")


class ImageMetadata(BaseModel):
    """Image metadata information"""
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")
    channels: int = Field(..., description="Number of color channels")
    format: str = Field(..., description="Image format (JPEG, PNG, etc.)")
    file_size: int = Field(..., description="File size in bytes")
    color_space: str = Field(default="RGB", description="Color space")


class ProcessingMetadata(BaseModel):
    """Processing metadata and statistics"""
    processing_time: float = Field(..., description="Processing time in seconds")
    engine: str = Field(..., description="OCR engine used")
    engine_version: str = Field(..., description="OCR engine version")
    preprocessing_applied: List[str] = Field(default_factory=list, description="Preprocessing steps applied")
    timestamp: datetime = Field(default_factory=datetime.now, description="Processing timestamp")


class OCRResult(BaseModel):
    """Complete OCR processing result"""
    filename: str = Field(..., description="Original filename")
    extracted_text: str = Field(..., description="Full extracted text")
    container_numbers: List[ContainerNumber] = Field(default_factory=list, description="Detected container numbers")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")
    bounding_boxes: List[BoundingBox] = Field(default_factory=list, description="All detected text regions")
    image_metadata: Optional[ImageMetadata] = Field(None, description="Image metadata")
    processing_metadata: ProcessingMetadata = Field(..., description="Processing metadata")
    success: bool = Field(default=True, description="Processing success status")
    error_message: Optional[str] = Field(None, description="Error message if processing failed")


class ProcessImageRequest(BaseModel):
    """Request model for image processing"""
    project_id: Optional[str] = Field(None, description="Project ID for context")
    preprocessing_options: Dict[str, Any] = Field(default_factory=dict, description="Preprocessing options")
    ocr_config: Dict[str, Any] = Field(default_factory=dict, description="OCR configuration")
    extract_container_numbers: bool = Field(default=True, description="Whether to extract container numbers")


class ProcessImageResponse(BaseModel):
    """Response model for image processing"""
    success: bool = Field(..., description="Processing success status")
    result: Optional[OCRResult] = Field(None, description="OCR result if successful")
    error: Optional[str] = Field(None, description="Error message if failed")
    processing_id: Optional[str] = Field(None, description="Processing ID for tracking")


class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str = Field(..., description="Service status")
    service: str = Field(..., description="Service name")
    version: str = Field(..., description="Service version")
    timestamp: datetime = Field(default_factory=datetime.now, description="Health check timestamp")
    dependencies: Dict[str, str] = Field(default_factory=dict, description="Dependency status")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")
    request_id: Optional[str] = Field(None, description="Request ID for tracking")
