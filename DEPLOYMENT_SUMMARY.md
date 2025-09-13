# IPTER Docker Hub Publishing & Deployment Summary

## 📋 Complete Step-by-Step Guide

### 🚀 **For Publishers (You)**

#### 1. **Prepare for Publishing**
```bash
# Navigate to IPTER directory
cd ipter

# Update the Docker Hub username in deployment files
# Edit deployment/docker-compose.yml and replace "your-dockerhub-username" with your actual username
```

#### 2. **Build and Publish (Choose One Method)**

**Method A: Automated Script (Recommended)**
```bash
# Linux/macOS
export DOCKER_USERNAME=your-dockerhub-username
export VERSION=v1.0.0  # Optional, defaults to 'latest'
chmod +x scripts/build-and-publish.sh
./scripts/build-and-publish.sh

# Windows
set DOCKER_USERNAME=your-dockerhub-username
set VERSION=v1.0.0
scripts\build-and-publish.bat
```

**Method B: Manual Commands**
```bash
# Build and tag
docker build -t your-dockerhub-username/ipter:latest .
docker build -t your-dockerhub-username/ipter:v1.0.0 .

# Test locally
docker run -d --name test -p 80:80 -p 8080:8080 your-dockerhub-username/ipter:latest
# Test at http://localhost:80, then clean up:
docker stop test && docker rm test

# Login and push
docker login
docker push your-dockerhub-username/ipter:latest
docker push your-dockerhub-username/ipter:v1.0.0
```

#### 3. **Distribute Deployment Files**
Share these files with users (they don't need source code):
- `deployment/docker-compose.yml`
- `deployment/.env.example`
- `deployment/README.md`
- `deployment/deploy.sh` (Linux/macOS)
- `deployment/deploy.bat` (Windows)

---

### 🌐 **For Users (Deployment)**

Users have **3 deployment options** and need **NO source code**:

#### **Option 1: Quick Deploy Script (Easiest)**
```bash
# Download deployment files
wget https://raw.githubusercontent.com/your-repo/ipter/main/deployment/docker-compose.yml
wget https://raw.githubusercontent.com/your-repo/ipter/main/deployment/.env.example
wget https://raw.githubusercontent.com/your-repo/ipter/main/deployment/deploy.sh

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

#### **Option 2: Docker Compose (Recommended)**
```bash
# Download files
wget https://raw.githubusercontent.com/your-repo/ipter/main/deployment/docker-compose.yml
wget https://raw.githubusercontent.com/your-repo/ipter/main/deployment/.env.example

# Configure
cp .env.example .env
nano .env  # Set GEMINI_API_KEY and JWT_SECRET

# Deploy
docker-compose up -d
```

#### **Option 3: Single Docker Command (Simplest)**
```bash
docker run -d \
  --name ipter-app \
  -p 80:80 -p 8080:8080 \
  -e GEMINI_API_KEY=your-api-key \
  -e JWT_SECRET=your-secure-secret \
  -v ipter-data:/app/data \
  -v ipter-uploads:/app/uploads \
  -v ipter-processed:/app/processed \
  -v ipter-reports:/app/reports \
  -v ipter-thumbnails:/app/thumbnails \
  -v ipter-logs:/app/logs \
  --restart unless-stopped \
  your-dockerhub-username/ipter:latest
```

---

## 📁 **What Users Need**

### **Required Files (Choose One)**

**Option A: Full Deployment Package**
- `docker-compose.yml` (main deployment file)
- `.env` (environment configuration)
- `deploy.sh` or `deploy.bat` (optional quick deploy script)

**Option B: Just Docker Compose**
- `docker-compose.yml`
- `.env` (created from `.env.example`)

**Option C: Nothing (Docker Run)**
- No files needed, just the docker run command with environment variables

### **Required Configuration**
Users MUST set these environment variables:
- `GEMINI_API_KEY`: Google Gemini API key (from https://makersuite.google.com/app/apikey)
- `JWT_SECRET`: Secure random string (32+ characters)

### **System Requirements**
- Docker and Docker Compose installed
- 2GB RAM minimum
- 1GB disk space minimum
- Ports 80 and 8080 available

---

## 💾 **Data Persistence**

### **Docker Volumes (Automatic)**
The application automatically creates these volumes:
- `ipter-data`: Database files (H2)
- `ipter-uploads`: User uploaded images/PDFs
- `ipter-processed`: Processed files
- `ipter-reports`: Generated reports
- `ipter-thumbnails`: Image thumbnails
- `ipter-logs`: Application logs

### **Backup & Restore**
```bash
# Backup
docker run --rm -v ipter-data:/data -v $(pwd):/backup alpine tar czf /backup/ipter-backup.tar.gz -C /data .

# Restore
docker run --rm -v ipter-data:/data -v $(pwd):/backup alpine tar xzf /backup/ipter-backup.tar.gz -C /data
```

---

## 🔧 **Environment Variables Reference**

### **Required**
| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSyBKPybSyqXhIHUsnR8RCpOXhYupuBREM3w` |
| `JWT_SECRET` | JWT signing secret | `mySecureRandomString32Characters` |

### **Optional**
| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | - |
| `USER_MAX_CONCURRENT_USERS` | Max concurrent users | `5` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost` |
| `LOGGING_LEVEL_COM_IPTER` | App logging level | `INFO` |

---

## 🌐 **Access Information**

After deployment, users can access:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/actuator/health
- **H2 Console**: http://localhost:8080/api/h2-console (if using H2)

**Default Login:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Must be changed on first login**

---

## 🔄 **Updates & Maintenance**

### **For Users to Update**
```bash
# Pull latest version
docker-compose pull

# Restart with new image
docker-compose up -d

# Clean up old images
docker image prune
```

### **For Publishers to Release Updates**
```bash
# Build new version
docker build -t your-dockerhub-username/ipter:v1.1.0 .
docker tag your-dockerhub-username/ipter:v1.1.0 your-dockerhub-username/ipter:latest

# Push updates
docker push your-dockerhub-username/ipter:v1.1.0
docker push your-dockerhub-username/ipter:latest
```

---

## 🛡️ **Security Best Practices**

### **For Publishers**
- ✅ Scan images for vulnerabilities
- ✅ Use multi-stage builds
- ✅ Don't include secrets in images
- ✅ Regular base image updates

### **For Users**
- ✅ Change default admin password
- ✅ Use strong JWT secrets (32+ chars)
- ✅ Set up HTTPS with reverse proxy
- ✅ Regular backups
- ✅ Update images regularly

---

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Port conflicts**: Change ports in docker-compose.yml
2. **API key errors**: Verify Gemini API key and quota
3. **Memory issues**: Ensure 2GB+ RAM available
4. **Permission issues**: Check Docker permissions

### **Debug Commands**
```bash
# Check container status
docker ps

# View logs
docker logs ipter-application

# Check health
curl http://localhost:8080/api/actuator/health

# Container shell access
docker exec -it ipter-application sh
```

---

## ✅ **Success Checklist**

### **For Publishers**
- [ ] Docker Hub repository created
- [ ] Image builds successfully
- [ ] Image pushed to Docker Hub
- [ ] Deployment files updated with correct image name
- [ ] Documentation complete
- [ ] Security review done

### **For Users**
- [ ] Docker installed and running
- [ ] Environment variables configured
- [ ] Ports 80 and 8080 available
- [ ] Application starts successfully
- [ ] Can access frontend at http://localhost:80
- [ ] Default password changed
- [ ] Backup strategy in place

---

## 🎉 **Final Result**

Once published, users can deploy IPTER with just:
```bash
docker run -p 80:80 -p 8080:8080 -e GEMINI_API_KEY=key your-dockerhub-username/ipter:latest
```

**No source code, no build process, no complex setup required!**

The application will be accessible at http://localhost:80 with full functionality for container number extraction from images.
