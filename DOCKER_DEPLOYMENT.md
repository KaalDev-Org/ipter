# IPTER Docker Deployment Guide

This guide explains how to build, run, and deploy the IPTER application using Docker containers.

## 🚀 Quick Start

### Option 1: One-Command Deployment (Recommended)

```bash
# Build and run with docker-compose (recommended)
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### Option 2: Using the Build Script

```bash
# On Linux/Mac
./build-and-run.sh

# On Windows
bash build-and-run.sh

# Run in detached mode
./build-and-run.sh -d
```

## 📋 Prerequisites

- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (2.0+)
- At least 2GB free disk space
- 4GB RAM recommended

## 🏗️ Project Structure

```
ipter/
├── Dockerfile                    # Multi-stage build configuration
├── docker-compose.yml           # Development configuration
├── build-and-run.sh            # Quick start script
├── .dockerignore               # Docker build optimization
└── docker/
    ├── application-docker.properties  # Container-specific config
    ├── nginx.conf                     # Nginx configuration
    ├── start.sh                       # Container startup script
    ├── build.sh                       # Advanced build script
    ├── run.sh                         # Advanced run script
    ├── docker-compose.prod.yml        # Production configuration
    └── .env.example                   # Environment template
```

## 🔧 Configuration

### Environment Variables

Copy the example environment file and customize:

```bash
cp docker/.env.example .env
```

**Required Variables:**
- `GEMINI_API_KEY`: Your Google Gemini API key
- `JWT_SECRET`: Secure JWT signing key (256+ bits)

**Optional Variables:**
- `MAX_CONCURRENT_USERS`: Maximum concurrent users (default: 5)
- `POSTGRES_PASSWORD`: Database password for production
- `ALLOWED_ORIGINS`: CORS allowed origins

### Example .env file:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
MAX_CONCURRENT_USERS=10
ALLOWED_ORIGINS=http://localhost,https://yourdomain.com
```

## 🐳 Docker Commands

### Building the Image

```bash
# Basic build
docker build -t ipter:latest .

# Build with custom tag
docker build -t ipter:v1.0.0 .

# Build without cache
docker build --no-cache -t ipter:latest .
```

### Running the Container

```bash
# Run with docker-compose (recommended)
docker-compose up

# Run single container
docker run -p 80:80 -p 8080:8080 ipter:latest

# Run in detached mode with volumes
docker run -d \
  --name ipter-app \
  -p 80:80 -p 8080:8080 \
  -v ipter-data:/app/data \
  -v ipter-uploads:/app/uploads \
  ipter:latest
```

## 🌐 Access Points

Once running, access the application at:

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080/api
- **H2 Database Console**: http://localhost:8080/api/h2-console
- **Health Check**: http://localhost:8080/api/actuator/health

### H2 Database Connection (Development)
- **JDBC URL**: `jdbc:h2:file:/app/data/ipter`
- **Username**: `ipter`
- **Password**: `password`

## 🏭 Production Deployment

### Using Production Configuration

```bash
# Start with production settings
docker-compose -f docker/docker-compose.prod.yml up -d

# Or with environment file
docker-compose -f docker/docker-compose.prod.yml --env-file .env up -d
```

### Production Features

- PostgreSQL database instead of H2
- Optimized logging levels
- Enhanced security headers
- Volume persistence for all data
- Health checks and restart policies

### Environment Setup for Production

```env
# Required for production
GEMINI_API_KEY=your_production_gemini_key
JWT_SECRET=your_production_jwt_secret_256_bits_minimum
POSTGRES_PASSWORD=your_secure_database_password

# Production optimizations
MAX_CONCURRENT_USERS=20
LOGGING_LEVEL_ROOT=WARN
SPRING_PROFILES_ACTIVE=prod
```

## 📊 Monitoring and Logs

### View Logs

```bash
# Docker Compose logs
docker-compose logs -f

# Single container logs
docker logs -f ipter-application

# Specific service logs
docker-compose logs -f ipter-app
```

### Health Monitoring

```bash
# Check application health
curl http://localhost:8080/api/actuator/health

# Check container status
docker ps

# Check resource usage
docker stats
```

## 🔄 Management Commands

### Stop and Start

```bash
# Stop services
docker-compose down

# Start services
docker-compose up -d

# Restart services
docker-compose restart
```

### Updates and Maintenance

```bash
# Rebuild and restart
docker-compose up --build -d

# Clean up old images
docker image prune

# Clean up volumes (⚠️ This will delete data!)
docker-compose down -v
```

## 🚢 Publishing to Registry

### Build for Registry

```bash
# Tag for registry
docker tag ipter:latest your-registry.com/ipter:latest

# Push to registry
docker push your-registry.com/ipter:latest
```

### Using Build Script for Registry

```bash
# Build and push to registry
./docker/build.sh --push --registry your-registry.com --tag v1.0.0
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :80
   # Or change ports in docker-compose.yml
   ```

2. **Permission Denied**
   ```bash
   # On Linux/Mac, make scripts executable
   chmod +x build-and-run.sh docker/build.sh docker/run.sh
   ```

3. **Out of Disk Space**
   ```bash
   # Clean up Docker
   docker system prune -a
   ```

4. **Container Won't Start**
   ```bash
   # Check logs for errors
   docker-compose logs ipter-app
   ```

### Performance Tuning

- Increase memory limit: Add `--memory=2g` to docker run
- Use SSD storage for volumes
- Monitor with `docker stats`

## 🔒 Security Considerations

- Change default JWT secret in production
- Use strong database passwords
- Keep Gemini API key secure
- Regular security updates: `docker-compose pull`
- Use HTTPS in production (add reverse proxy)

## 🪟 Windows Users

Use the provided batch file for easy deployment:

```cmd
REM Build and run (foreground)
build-and-run.bat

REM Build and run (detached)
build-and-run.bat -d

REM Production mode
build-and-run.bat -p -d
```

## 🐧 Linux/Mac Users

Use the shell script:

```bash
# Make executable (first time only)
chmod +x build-and-run.sh

# Build and run
./build-and-run.sh

# Detached mode
./build-and-run.sh -d
```

## 📝 Additional Notes

- The application uses H2 database by default (development)
- All data is persisted in Docker volumes
- Frontend is served by Nginx for better performance
- Backend runs on Java 17 with Spring Boot
- Container includes health checks and graceful shutdown
- Multi-stage build optimizes image size
- Supports both development and production configurations
