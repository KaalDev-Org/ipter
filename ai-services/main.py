"""
IPTER AI Services - FastAPI Application
Main entry point for the Python AI services backend
"""
import os
import logging
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from typing import Optional

from models.ocr_models import (
    OCRResult, ProcessImageRequest, ProcessImageResponse, 
    HealthCheckResponse, ErrorResponse
)
from services.ocr_service import OCRService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global service instances
ocr_service: Optional[OCRService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global ocr_service
    
    # Startup
    logger.info("Starting IPTER AI Services...")
    try:
        ocr_service = OCRService()
        logger.info("OCR Service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize OCR Service: {str(e)}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down IPTER AI Services...")


# Create FastAPI app
app = FastAPI(
    title="IPTER AI Services",
    description="AI-powered text extraction and image processing services for IPTER",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],  # Java backend and React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_ocr_service() -> OCRService:
    """Dependency to get OCR service instance"""
    if ocr_service is None:
        raise HTTPException(status_code=503, detail="OCR service not initialized")
    return ocr_service


@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Root endpoint with basic service information"""
    return HealthCheckResponse(
        status="healthy",
        service="IPTER AI Services",
        version="1.0.0",
        dependencies={
            "tesseract": "available" if ocr_service else "unavailable",
            "opencv": "available",
            "pillow": "available"
        }
    )


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test OCR service
        service_status = "healthy" if ocr_service else "unhealthy"
        
        return HealthCheckResponse(
            status=service_status,
            service="IPTER AI Services",
            version="1.0.0",
            dependencies={
                "tesseract": "available" if ocr_service else "unavailable",
                "opencv": "available",
                "pillow": "available"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.post("/ocr/extract-text", response_model=OCRResult)
async def extract_text_from_image(
    file: UploadFile = File(...),
    service: OCRService = Depends(get_ocr_service)
):
    """
    Extract text from uploaded image using OCR
    
    Args:
        file: Uploaded image file
        service: OCR service instance
    
    Returns:
        OCR result with extracted text and metadata
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type: {file.content_type}. Only image files are supported."
            )
        
        # Check file size (max 10MB)
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 10MB."
            )
        
        # Reset file pointer
        await file.seek(0)
        content = await file.read()
        
        logger.info(f"Processing image: {file.filename}, size: {len(content)} bytes")
        
        # Process image
        result = await service.extract_text(content, file.filename or "unknown")
        
        if not result.success:
            raise HTTPException(
                status_code=500,
                detail=f"OCR processing failed: {result.error_message}"
            )
        
        logger.info(f"Successfully processed {file.filename}: "
                   f"{len(result.container_numbers)} container numbers found")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.post("/ocr/extract-containers", response_model=OCRResult)
async def extract_container_numbers(
    file: UploadFile = File(...),
    service: OCRService = Depends(get_ocr_service)
):
    """
    Extract container numbers specifically from images
    Optimized for container number detection
    
    Args:
        file: Uploaded image file
        service: OCR service instance
    
    Returns:
        OCR result focused on container numbers
    """
    try:
        # Validate file
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Only image files are supported."
            )
        
        # Check file size
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 10MB."
            )
        
        logger.info(f"Processing container image: {file.filename}, size: {len(content)} bytes")
        
        # Process with container-specific optimization
        result = await service.extract_container_numbers(content, file.filename or "unknown")
        
        if not result.success:
            raise HTTPException(
                status_code=500,
                detail=f"Container extraction failed: {result.error_message}"
            )
        
        logger.info(f"Container extraction completed for {file.filename}: "
                   f"{len(result.container_numbers)} numbers found")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in container extraction for {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.post("/ocr/process-image", response_model=ProcessImageResponse)
async def process_image_with_options(
    file: UploadFile = File(...),
    request: ProcessImageRequest = None,
    service: OCRService = Depends(get_ocr_service)
):
    """
    Process image with custom options
    
    Args:
        file: Uploaded image file
        request: Processing options
        service: OCR service instance
    
    Returns:
        Processing response with results
    """
    try:
        # Validate file
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}"
            )
        
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File size too large. Maximum size is 10MB."
            )
        
        # Use provided options or defaults
        options = request.preprocessing_options if request else {}
        
        logger.info(f"Processing image with options: {file.filename}")
        
        # Process image
        if request and request.extract_container_numbers:
            result = await service.extract_container_numbers(content, file.filename or "unknown")
        else:
            result = await service.extract_text(content, file.filename or "unknown", options)
        
        return ProcessImageResponse(
            success=result.success,
            result=result if result.success else None,
            error=result.error_message if not result.success else None,
            processing_id=f"proc_{int(time.time())}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in image processing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc)
        ).dict()
    )


if __name__ == "__main__":
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8001"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting IPTER AI Services on {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
