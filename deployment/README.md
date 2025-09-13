# IPTER Application - Easy Deployment Guide

This directory contains everything you need to deploy the IPTER application on any system with Docker, **without requiring the source code**.

## 🚀 Quick Start (3 Steps)

### Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available
- At least 1GB disk space available

### Step 1: Download Deployment Files
Download these files to your server:
- `docker-compose.yml`
- `.env.example`

### Step 2: Configure Environment
```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your settings
nano .env  # or use any text editor
```

**Required Configuration:**
- Set your `GEMINI_API_KEY` (get it from https://makersuite.google.com/app/apikey)
- Set a secure `JWT_SECRET` (generate with: `openssl rand -base64 32`)

### Step 3: Start the Application
```bash
# Start IPTER
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Access the application:**
- Frontend: http://localhost:80
- Backend API: http://localhost:8080/api
- Health Check: http://localhost:8080/api/actuator/health

**Default Login:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change this password immediately after first login!**

## 🐳 Alternative: Docker Run Commands

If you prefer not to use docker-compose, you can run IPTER with a single Docker command:

### Basic Deployment
```bash
docker run -d \
  --name ipter-app \
  -p 80:80 \
  -p 8080:8080 \
  -e GEMINI_API_KEY=your-api-key-here \
  -e JWT_SECRET=your-secure-secret-here \
  -v ipter-data:/app/data \
  -v ipter-uploads:/app/uploads \
  -v ipter-processed:/app/processed \
  -v ipter-reports:/app/reports \
  -v ipter-thumbnails:/app/thumbnails \
  -v ipter-logs:/app/logs \
  --restart unless-stopped \
  your-dockerhub-username/ipter:latest
```

### Production Deployment with PostgreSQL
```bash
# Start PostgreSQL first
docker run -d \
  --name ipter-postgres \
  -e POSTGRES_DB=ipter \
  -e POSTGRES_USER=ipter \
  -e POSTGRES_PASSWORD=secure-password \
  -v ipter-postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  --restart unless-stopped \
  postgres:15-alpine

# Start IPTER with PostgreSQL
docker run -d \
  --name ipter-app \
  --link ipter-postgres:postgres \
  -p 80:80 \
  -p 8080:8080 \
  -e GEMINI_API_KEY=your-api-key-here \
  -e JWT_SECRET=your-secure-secret-here \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ipter \
  -e SPRING_DATASOURCE_USERNAME=ipter \
  -e SPRING_DATASOURCE_PASSWORD=secure-password \
  -v ipter-uploads:/app/uploads \
  -v ipter-processed:/app/processed \
  -v ipter-reports:/app/reports \
  -v ipter-thumbnails:/app/thumbnails \
  -v ipter-logs:/app/logs \
  --restart unless-stopped \
  your-dockerhub-username/ipter:latest
```

## 📁 Data Persistence

IPTER uses Docker volumes for data persistence:

- **`ipter-data`**: Database files (H2)
- **`ipter-uploads`**: Uploaded images and PDFs
- **`ipter-processed`**: Processed files
- **`ipter-reports`**: Generated reports
- **`ipter-thumbnails`**: Image thumbnails
- **`ipter-logs`**: Application logs

### Backup Data
```bash
# Backup all volumes
docker run --rm -v ipter-data:/data -v $(pwd):/backup alpine tar czf /backup/ipter-data-backup.tar.gz -C /data .
docker run --rm -v ipter-uploads:/data -v $(pwd):/backup alpine tar czf /backup/ipter-uploads-backup.tar.gz -C /data .
# ... repeat for other volumes
```

### Restore Data
```bash
# Restore volumes
docker run --rm -v ipter-data:/data -v $(pwd):/backup alpine tar xzf /backup/ipter-data-backup.tar.gz -C /data
# ... repeat for other volumes
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | - | ✅ Yes |
| `JWT_SECRET` | JWT signing secret | - | ✅ Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | - | Only if using PostgreSQL |
| `USER_MAX_CONCURRENT_USERS` | Max concurrent users | 5 | No |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | localhost | No |

### Using PostgreSQL Instead of H2

1. Uncomment the PostgreSQL service in `docker-compose.yml`
2. Set `POSTGRES_PASSWORD` in your `.env` file
3. Uncomment the PostgreSQL environment variables in the IPTER service

## 🔍 Troubleshooting

### Application Won't Start
```bash
# Check container logs
docker-compose logs ipter-app

# Check container status
docker-compose ps

# Restart the application
docker-compose restart ipter-app
```

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml if 80 or 8080 are in use
2. **API key issues**: Verify your Gemini API key is correct and has quota
3. **Memory issues**: Ensure you have at least 2GB RAM available
4. **Permission issues**: Check Docker has permission to create volumes

### Health Check
```bash
# Check if the application is healthy
curl http://localhost:8080/api/actuator/health

# Expected response:
# {"status":"UP"}
```

## 🛡️ Security Considerations

### For Production Deployment:

1. **Change default credentials** immediately after first login
2. **Use strong JWT secret** (generate with `openssl rand -base64 32`)
3. **Use PostgreSQL** instead of H2 for production
4. **Set up HTTPS** with a reverse proxy (nginx/Apache)
5. **Configure firewall** to restrict access to necessary ports only
6. **Regular backups** of data volumes
7. **Update CORS origins** to match your domain

### Reverse Proxy Example (nginx)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs -f`
3. Verify your environment configuration
4. Check system resources (RAM, disk space)

## 🔄 Updates

To update to a newer version:
```bash
# Pull the latest image
docker-compose pull

# Restart with new image
docker-compose up -d

# Clean up old images (optional)
docker image prune
```
