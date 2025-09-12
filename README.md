# IPTER - Image Processing Text Extraction and Recognition

## Project Overview

IPTER is a comprehensive image processing application designed for extracting text and container numbers from images using OCR (Optical Character Recognition) technology. The application features a React frontend, Java Spring Boot backend, and Python AI services for advanced image processing.

## Architecture

- **Frontend**: React + TypeScript with Ant Design UI components
- **Backend**: Java Spring Boot with Spring Security and JWT authentication
- **AI Services**: Python FastAPI with Tesseract OCR and OpenCV
- **Database**: H2 (development) / PostgreSQL (production)
- **Authentication**: JWT-based with role-based access control
- **Session Management**: Concurrent user limit (configurable, default: 5 users)

## Current Implementation Status

### ✅ Completed - Backend Foundation

1. **Project Structure**
   - Maven-based Spring Boot project
   - Proper package organization
   - Configuration files setup

2. **Database Models**
   - User entity with Spring Security integration
   - Project entity for organizing image processing tasks
   - Image entity for uploaded files
   - ExtractedData entity for OCR results
   - Supporting enums (UserRole, ProjectStatus, ProcessingStatus, etc.)

3. **Repository Layer**
   - JPA repositories for all entities
   - Custom query methods
   - Pagination support

4. **Security Implementation**
   - JWT-based authentication
   - Role-based access control (USER, SUPER_USER, ADMIN)
   - Password encryption with BCrypt
   - CORS configuration
   - Security filter chain

5. **Authentication System**
   - User registration and login
   - JWT token generation and validation
   - Session management with concurrent user limits
   - Password reset capabilities
   - Account lockout after failed attempts

6. **Core Services**
   - AuthService for authentication operations
   - SessionManagementService for concurrent user management
   - UserDetailsService for Spring Security integration
   - DataInitializationService for default admin creation

7. **API Controllers**
   - AuthController with login/register/logout endpoints
   - JWT token refresh and validation
   - Session information endpoints

8. **Configuration**
   - Application properties with comprehensive settings
   - Security configuration
   - Database configuration (H2 for development)
   - File upload configuration

## Default Users

When the application starts, it automatically creates a default admin user:

- **Username**: admin
- **Password**: admin123
- **Email**: admin@ipter.local
- **Role**: ADMIN

⚠️ **Important**: Change the default password on first login!

## Project Structure

```
ipter/
├── backend/                          # Java Spring Boot backend
│   ├── pom.xml                      # Maven dependencies
│   ├── src/main/java/com/ipter/
│   │   ├── IpterApplication.java    # Main Spring Boot application
│   │   ├── config/                  # Configuration classes
│   │   │   └── SecurityConfig.java  # Security configuration
│   │   ├── controller/              # REST Controllers
│   │   │   └── AuthController.java  # Authentication endpoints
│   │   ├── service/                 # Business logic services
│   │   │   ├── AuthService.java
│   │   │   ├── SessionManagementService.java
│   │   │   ├── UserDetailsServiceImpl.java
│   │   │   └── DataInitializationService.java
│   │   ├── repository/              # Data access layer
│   │   │   ├── UserRepository.java
│   │   │   ├── ProjectRepository.java
│   │   │   ├── ImageRepository.java
│   │   │   └── ExtractedDataRepository.java
│   │   ├── model/                   # Entity classes
│   │   │   ├── User.java
│   │   │   ├── Project.java
│   │   │   ├── Image.java
│   │   │   ├── ExtractedData.java
│   │   │   └── [Various enums]
│   │   ├── dto/                     # Data transfer objects
│   │   │   ├── LoginRequest.java
│   │   │   ├── LoginResponse.java
│   │   │   └── RegisterRequest.java
│   │   ├── security/                # Security components
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── JwtAuthenticationEntryPoint.java
│   │   └── util/                    # Utility classes
│   │       └── JwtUtil.java         # JWT token utilities
│   └── src/main/resources/
│       ├── application.properties   # Application configuration
│       └── application-test.properties # Test configuration
├── frontend/                        # React frontend (to be implemented)
├── ai-services/                     # Python AI services (to be implemented)
└── README.md                        # This file
```

## Next Steps

### 🔄 In Progress
- Setting up Maven for building the project
- Testing the backend implementation

### 📋 TODO - Backend
1. **Image Processing Services**
   - ImageService for file upload and management
   - Integration with Python AI services
   - File storage management
   - Thumbnail generation

2. **Project Management**
   - ProjectService for CRUD operations
   - Project statistics and reporting
   - Bulk image processing

3. **Additional Controllers**
   - ProjectController
   - ImageController
   - ReportController
   - AdminController

4. **Validation and Error Handling**
   - Global exception handler
   - Input validation
   - Custom error responses

### 📋 TODO - Frontend (React)
1. **Project Setup**
   - Create React application with TypeScript
   - Setup Ant Design UI library
   - Configure Redux for state management
   - Setup React Router for navigation

2. **Authentication UI**
   - Login/Register forms
   - Protected routes
   - User profile management

3. **Main Application UI**
   - Dashboard with statistics
   - Project management interface
   - Image upload and processing
   - Results viewing and validation

### 📋 TODO - AI Services (Python)
1. **FastAPI Setup**
   - Create Python FastAPI application
   - Setup OCR services (Tesseract, PaddleOCR)
   - Image preprocessing with OpenCV
   - Container number pattern recognition

2. **Integration**
   - HTTP API for Java backend integration
   - File handling and processing
   - Error handling and logging

## Configuration

### Database
- **Development**: H2 in-memory database
- **Production**: PostgreSQL (configurable)
- **Console**: Available at `/api/h2-console` (development only)

### Security
- **JWT Secret**: Configurable via `jwt.secret`
- **Token Expiration**: 24 hours (configurable)
- **Max Concurrent Users**: 5 (configurable via `user.max-concurrent-users`)
- **Session Timeout**: 1 hour (configurable)

### File Upload
- **Max File Size**: 50MB
- **Supported Formats**: JPG, PNG, BMP, TIFF
- **Upload Directory**: `./uploads` (configurable)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/validate` - Validate JWT token
- `GET /api/auth/session-info` - Get session information

### Health Check
- `GET /api/actuator/health` - Application health status
- `GET /api/actuator/info` - Application information

## Development Setup

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- Node.js 16 or higher (for frontend)
- Python 3.8 or higher (for AI services)

### Running the Backend
```bash
cd backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Testing
```bash
cd backend
mvn test
```

## 🐳 Docker Deployment (Recommended)

The easiest way to run IPTER is using Docker. This method handles all dependencies and configuration automatically.

### Quick Start with Docker

```bash
# One-command deployment
docker-compose up --build

# Or use the convenience script
./build-and-run.sh    # Linux/Mac
build-and-run.bat     # Windows
```

### What You Get

- ✅ Complete application stack (frontend + backend)
- ✅ All dependencies pre-installed
- ✅ Production-ready configuration
- ✅ Automatic data persistence
- ✅ Health checks and monitoring
- ✅ Easy scaling and deployment

### Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **Database Console**: http://localhost:8080/api/h2-console

### Requirements

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- 4GB RAM recommended
- 2GB free disk space

For detailed Docker deployment instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md).

## License
This project is proprietary software for on-premises deployment with licensing restrictions as specified in the project requirements.
