# IPTER AI Services

Python-based AI services for the IPTER application, providing OCR (Optical Character Recognition) and image processing capabilities.

## Features

- **Text Extraction**: Extract text from images using Tesseract OCR
- **Container Number Detection**: Specialized extraction of container numbers from images
- **Image Preprocessing**: Automatic image enhancement for better OCR results
- **RESTful API**: FastAPI-based REST API for easy integration
- **Flexible Configuration**: Configurable OCR settings and preprocessing options

## Prerequisites

### System Requirements
- Python 3.8 or higher
- Tesseract OCR engine

### Installing Tesseract OCR

#### Windows
1. Download Tesseract installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install and add to system PATH
3. Verify installation: `tesseract --version`

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install libtesseract-dev
```

#### macOS
```bash
brew install tesseract
```

## Installation

1. **Navigate to the ai-services directory**:
   ```bash
   cd ipter/ai-services
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify installation**:
   ```bash
   python start.py
   ```

## Configuration

1. **Copy environment configuration**:
   ```bash
   cp .env.example .env
   ```

2. **Edit configuration** (optional):
   ```bash
   # .env file
   HOST=0.0.0.0
   PORT=8001
   DEBUG=false
   MAX_IMAGE_SIZE=10485760  # 10MB
   ```

## Running the Service

### Development Mode
```bash
python start.py
```

### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Using Docker (optional)
```bash
# Build image
docker build -t ipter-ai-services .

# Run container
docker run -p 8001:8001 ipter-ai-services
```

## API Endpoints

The service will be available at `http://localhost:8001`

### Health Check
- **GET** `/health` - Service health status
- **GET** `/` - Basic service information

### OCR Services
- **POST** `/ocr/extract-text` - Extract all text from image
- **POST** `/ocr/extract-containers` - Extract container numbers (optimized)
- **POST** `/ocr/process-image` - Process image with custom options

### API Documentation
- Interactive API docs: `http://localhost:8001/docs`
- OpenAPI schema: `http://localhost:8001/openapi.json`

## Usage Examples

### Extract Text from Image
```bash
curl -X POST "http://localhost:8001/ocr/extract-text" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@container_image.jpg"
```

### Extract Container Numbers
```bash
curl -X POST "http://localhost:8001/ocr/extract-containers" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@container_image.jpg"
```

## Integration with Java Backend

The Java backend communicates with this service via HTTP requests. The Java `ImageService` sends images to these endpoints and processes the responses.

Example Java integration:
```java
// In ImageService.java
RestTemplate restTemplate = new RestTemplate();
String aiServiceUrl = "http://localhost:8001";

MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
body.add("file", new ByteArrayResource(imageBytes));

HttpEntity<MultiValueMap<String, Object>> requestEntity = 
    new HttpEntity<>(body, headers);

ResponseEntity<OCRResult> response = restTemplate.postForEntity(
    aiServiceUrl + "/ocr/extract-containers",
    requestEntity,
    OCRResult.class
);
```

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- TIFF (.tiff, .tif)
- BMP (.bmp)

## Performance Considerations

- **Image Size**: Maximum 10MB per image
- **Processing Time**: Typically 2-5 seconds per image
- **Concurrent Requests**: Supports multiple concurrent requests
- **Memory Usage**: ~100-200MB base memory usage

## Troubleshooting

### Common Issues

1. **Tesseract not found**:
   - Ensure Tesseract is installed and in system PATH
   - On Windows, add Tesseract installation directory to PATH

2. **Poor OCR results**:
   - Ensure images are high quality and well-lit
   - Container numbers should be clearly visible
   - Try different image formats or preprocessing options

3. **Service startup fails**:
   - Check Python version (3.8+ required)
   - Verify all dependencies are installed
   - Check port 8001 is not in use

### Logs
Service logs are written to console. For production, configure proper logging:

```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai-services.log'),
        logging.StreamHandler()
    ]
)
```

## Development

### Project Structure
```
ai-services/
├── main.py              # FastAPI application
├── start.py             # Startup script
├── requirements.txt     # Python dependencies
├── models/              # Pydantic models
│   └── ocr_models.py
├── services/            # Business logic
│   └── ocr_service.py
└── utils/               # Utilities
    └── image_utils.py
```

### Adding New Features
1. Add new models in `models/`
2. Implement business logic in `services/`
3. Add API endpoints in `main.py`
4. Update documentation

## License

This project is part of the IPTER application suite.
