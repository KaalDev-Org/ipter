# IPTER Docker Setup Guide

This guide explains how to run the IPTER application using Docker.

## Prerequisites

- Docker and Docker Compose installed
- At least 2GB of available RAM
- At least 1GB of available disk space

## Quick Start

1. **Clone or navigate to the IPTER directory**
   ```bash
   cd ipter
   ```

2. **Set up environment variables (optional)**
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys and configuration
   ```

3. **Build and run the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080/api
   - Health Check: http://localhost:8080/api/actuator/health

## Configuration

### Environment Variables

The application can be configured using environment variables. See `.env.example` for all available options.

Key variables:
- `GEMINI_API_KEY`: Your Google Gemini API key (required for AI processing)
- `JWT_SECRET`: Secret key for JWT authentication (change in production)
- `POSTGRES_PASSWORD`: Password for PostgreSQL (if using production profile)

### Using PostgreSQL (Production)

To use PostgreSQL instead of H2:

```bash
docker-compose --profile production up --build
```

This will start both the application and a PostgreSQL database.

## Docker Services

### ipter-app
- **Ports**: 80 (frontend), 8080 (backend)
- **Volumes**: Data, uploads, processed files, reports, thumbnails, logs
- **Health Check**: Automatic health monitoring

### ipter-db (production profile only)
- **Port**: 5432
- **Database**: PostgreSQL 15
- **Volume**: Persistent data storage

## Data Persistence

The following directories are persisted using Docker volumes:
- `/app/data` - Database files (H2)
- `/app/uploads` - Uploaded images and PDFs
- `/app/processed` - Processed files
- `/app/reports` - Generated reports
- `/app/thumbnails` - Image thumbnails
- `/app/logs` - Application logs

## Troubleshooting

### Container won't start
1. Check Docker logs: `docker-compose logs ipter-app`
2. Ensure ports 80 and 8080 are not in use
3. Verify you have enough disk space and memory

### API not responding
1. Check health endpoint: http://localhost:8080/api/actuator/health
2. Check backend logs: `docker-compose logs ipter-app`
3. Verify Gemini API key is set correctly

### Frontend not loading
1. Check nginx logs in container
2. Verify frontend build completed successfully
3. Check browser console for errors

## Development

### Rebuilding after changes
```bash
docker-compose down
docker-compose up --build
```

### Viewing logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ipter-app
```

### Accessing container shell
```bash
docker-compose exec ipter-app /bin/sh
```

## Production Deployment

For production deployment:

1. **Use PostgreSQL profile**
   ```bash
   docker-compose --profile production up -d
   ```

2. **Set secure environment variables**
   - Generate a strong JWT secret
   - Use a secure PostgreSQL password
   - Set appropriate CORS origins

3. **Configure reverse proxy** (recommended)
   - Use nginx or Apache as a reverse proxy
   - Enable HTTPS/SSL
   - Configure proper security headers

4. **Set up monitoring**
   - Monitor health endpoint
   - Set up log aggregation
   - Configure alerts for failures

## Stopping the Application

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v
```
