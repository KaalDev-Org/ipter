# IPTER Docker Hub Publishing Guide

This guide covers the complete process of publishing the IPTER Docker image to Docker Hub and enabling easy deployment on other systems.

## 📋 Prerequisites

1. **Docker Hub Account**: Create account at https://hub.docker.com
2. **Docker Desktop**: Installed and running locally
3. **IPTER Source Code**: Current working directory with Dockerfile
4. **Docker Hub Repository**: Create a repository named `ipter` on Docker Hub

## 🚀 Step 1: Prepare and Tag the Docker Image

### Option A: Using the Automated Script (Recommended)

#### For Linux/macOS:
```bash
# Make the script executable
chmod +x scripts/build-and-publish.sh

# Set your Docker Hub username
export DOCKER_USERNAME=your-dockerhub-username

# Optional: Set version (defaults to 'latest')
export VERSION=v1.0.0

# Run the script
./scripts/build-and-publish.sh
```

#### For Windows:
```cmd
# Set your Docker Hub username
set DOCKER_USERNAME=your-dockerhub-username

# Optional: Set version (defaults to 'latest')
set VERSION=v1.0.0

# Run the script
scripts\build-and-publish.bat
```

### Option B: Manual Process

#### 1. Build the Image
```bash
# Navigate to the IPTER directory
cd ipter

# Build the image with proper tags
docker build -t your-dockerhub-username/ipter:latest .
docker build -t your-dockerhub-username/ipter:v1.0.0 .
```

#### 2. Test the Image Locally
```bash
# Test the built image
docker run -d --name ipter-test -p 80:80 -p 8080:8080 your-dockerhub-username/ipter:latest

# Check if it's working
curl http://localhost:8080/api/actuator/health

# Clean up test container
docker stop ipter-test && docker rm ipter-test
```

## 🔐 Step 2: Docker Hub Authentication

### Login to Docker Hub
```bash
# Login to Docker Hub
docker login

# Enter your Docker Hub username and password when prompted
```

### Alternative: Use Access Token (Recommended for CI/CD)
```bash
# Create an access token in Docker Hub settings
# Then login with token instead of password
docker login -u your-dockerhub-username -p your-access-token
```

## 📤 Step 3: Push the Image to Docker Hub

```bash
# Push the latest tag
docker push your-dockerhub-username/ipter:latest

# Push the version tag
docker push your-dockerhub-username/ipter:v1.0.0
```

### Verify the Push
1. Go to https://hub.docker.com/r/your-dockerhub-username/ipter
2. Verify both tags are visible
3. Check the image size and build date

## 📦 Step 4: Prepare Deployment Package for Users

### Create Deployment Package
Users will need these files (no source code required):

```
deployment/
├── docker-compose.yml     # Main deployment file
├── .env.example          # Environment template
└── README.md            # Deployment instructions
```

### Update docker-compose.yml
Replace the image reference in `deployment/docker-compose.yml`:
```yaml
services:
  ipter-app:
    image: your-dockerhub-username/ipter:latest  # Update this line
```

## 🌐 Step 5: How Users Deploy the Published Image

### Method 1: Docker Compose (Recommended)

Users need only 2 files:
1. `docker-compose.yml`
2. `.env` (copied from `.env.example`)

```bash
# User downloads the deployment files
wget https://raw.githubusercontent.com/your-repo/ipter/main/deployment/docker-compose.yml
wget https://raw.githubusercontent.com/your-repo/ipter/main/deployment/.env.example

# Configure environment
cp .env.example .env
nano .env  # Edit with their API keys

# Deploy
docker-compose up -d
```

### Method 2: Single Docker Run Command

Users can deploy with a single command (no files needed):
```bash
docker run -d \
  --name ipter-app \
  -p 80:80 \
  -p 8080:8080 \
  -e GEMINI_API_KEY=their-api-key \
  -e JWT_SECRET=their-secure-secret \
  -v ipter-data:/app/data \
  -v ipter-uploads:/app/uploads \
  -v ipter-processed:/app/processed \
  -v ipter-reports:/app/reports \
  -v ipter-thumbnails:/app/thumbnails \
  -v ipter-logs:/app/logs \
  --restart unless-stopped \
  your-dockerhub-username/ipter:latest
```

## 🔧 Step 6: Environment Variables and Configuration

### Required Environment Variables
Users must set these:
- `GEMINI_API_KEY`: Their Google Gemini API key
- `JWT_SECRET`: A secure random string (32+ characters)

### Optional Environment Variables
- `POSTGRES_PASSWORD`: If using PostgreSQL
- `USER_MAX_CONCURRENT_USERS`: Max concurrent users (default: 5)
- `CORS_ALLOWED_ORIGINS`: Allowed domains for CORS

### Configuration Methods

#### Option 1: .env File (with docker-compose)
```bash
# .env file
GEMINI_API_KEY=user-api-key-here
JWT_SECRET=user-secure-secret-here
```

#### Option 2: Environment Variables (with docker run)
```bash
docker run -e GEMINI_API_KEY=key -e JWT_SECRET=secret ...
```

#### Option 3: Docker Compose Override
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  ipter-app:
    environment:
      - GEMINI_API_KEY=user-api-key
      - JWT_SECRET=user-secret
```

## 💾 Step 7: Data Persistence Considerations

### Docker Volumes (Recommended)
The image uses named volumes for persistence:
```yaml
volumes:
  - ipter-data:/app/data          # Database files
  - ipter-uploads:/app/uploads    # User uploads
  - ipter-processed:/app/processed # Processed files
  - ipter-reports:/app/reports    # Generated reports
  - ipter-thumbnails:/app/thumbnails # Thumbnails
  - ipter-logs:/app/logs         # Application logs
```

### Host Bind Mounts (Alternative)
Users can also use host directories:
```yaml
volumes:
  - ./data:/app/data
  - ./uploads:/app/uploads
  - ./processed:/app/processed
  - ./reports:/app/reports
  - ./thumbnails:/app/thumbnails
  - ./logs:/app/logs
```

### Backup and Migration
```bash
# Backup volumes
docker run --rm -v ipter-data:/data -v $(pwd):/backup alpine tar czf /backup/ipter-backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v ipter-data:/data -v $(pwd):/backup alpine tar xzf /backup/ipter-backup.tar.gz -C /data
```

## 🔄 Step 8: Version Management and Updates

### Semantic Versioning
Use semantic versioning for releases:
- `v1.0.0`: Major release
- `v1.1.0`: Minor release (new features)
- `v1.0.1`: Patch release (bug fixes)

### Multi-tag Strategy
```bash
# Tag and push multiple versions
docker tag your-dockerhub-username/ipter:latest your-dockerhub-username/ipter:v1.0.0
docker tag your-dockerhub-username/ipter:latest your-dockerhub-username/ipter:v1.0
docker tag your-dockerhub-username/ipter:latest your-dockerhub-username/ipter:v1

docker push your-dockerhub-username/ipter:v1.0.0
docker push your-dockerhub-username/ipter:v1.0
docker push your-dockerhub-username/ipter:v1
docker push your-dockerhub-username/ipter:latest
```

### User Update Process
```bash
# Pull latest version
docker-compose pull

# Restart with new image
docker-compose up -d

# Clean up old images
docker image prune
```

## 📚 Step 9: Documentation for Users

### What Users Need to Know

1. **System Requirements**:
   - Docker and Docker Compose
   - 2GB RAM minimum
   - 1GB disk space minimum

2. **Required Configuration**:
   - Gemini API key (from Google)
   - Secure JWT secret

3. **Default Credentials**:
   - Username: `admin`
   - Password: `admin123`
   - Must be changed on first login

4. **Access URLs**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080/api
   - Health Check: http://localhost:8080/api/actuator/health

### Distribution Methods

1. **GitHub Repository**: Host deployment files in a separate repo
2. **Docker Hub Description**: Include deployment instructions
3. **Documentation Website**: Create a dedicated docs site
4. **Release Notes**: Include deployment info in releases

## 🛡️ Security Best Practices

### For Publishers
1. **Scan images** for vulnerabilities before publishing
2. **Use multi-stage builds** to minimize image size
3. **Don't include secrets** in the image
4. **Regular updates** of base images and dependencies

### For Users
1. **Change default passwords** immediately
2. **Use strong JWT secrets** (32+ characters)
3. **Set up HTTPS** with reverse proxy
4. **Regular backups** of data volumes
5. **Update images** regularly

## 🔍 Troubleshooting Common Issues

### Build Issues
- **Docker daemon not running**: Start Docker Desktop
- **Permission denied**: Run with sudo (Linux) or check Docker Desktop permissions
- **Out of disk space**: Clean up with `docker system prune`

### Push Issues
- **Authentication failed**: Check Docker Hub credentials
- **Repository not found**: Create repository on Docker Hub first
- **Rate limits**: Wait or upgrade Docker Hub plan

### Deployment Issues
- **Port conflicts**: Change ports in docker-compose.yml
- **API key errors**: Verify Gemini API key is correct
- **Memory issues**: Ensure sufficient RAM available

## ✅ Final Checklist

Before publishing:
- [ ] Image builds successfully
- [ ] Image runs correctly locally
- [ ] All required environment variables documented
- [ ] Deployment files tested
- [ ] Documentation complete
- [ ] Security review completed
- [ ] Version tags applied correctly
- [ ] Docker Hub repository configured
- [ ] Push completed successfully
- [ ] Deployment instructions verified

## 🎉 Success!

Once published, users can deploy IPTER with just:
```bash
docker run -p 80:80 -p 8080:8080 -e GEMINI_API_KEY=key your-dockerhub-username/ipter:latest
```

No source code, no build process, no complex setup required!
