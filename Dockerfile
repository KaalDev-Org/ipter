# Multi-stage Dockerfile for IPTER Application
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies (include devDependencies needed for build)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build Backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder

WORKDIR /app/backend

# Copy Maven files
COPY backend/pom.xml ./

# Download dependencies (for better caching)
RUN mvn dependency:go-offline -B

# Copy backend source
COPY backend/src ./src

# Build backend
RUN mvn clean package -DskipTests

# Stage 3: Production Runtime
FROM eclipse-temurin:17-jre-alpine

# Install nginx, curl, and dos2unix for serving frontend and health checks
RUN apk add --no-cache nginx curl dos2unix

# Create application user
RUN addgroup -g 1000 ipter && \
    adduser -D -s /bin/sh -u 1000 -G ipter ipter

# Create necessary directories
RUN mkdir -p /app/data /app/uploads /app/processed /app/reports /app/thumbnails /app/logs && \
    mkdir -p /tmp/nginx /var/lib/nginx/tmp/client_body /var/lib/nginx/tmp/proxy /var/lib/nginx/tmp/fastcgi /var/lib/nginx/tmp/uwsgi /var/lib/nginx/tmp/scgi && \
    chown -R ipter:ipter /app /tmp/nginx /var/lib/nginx

# Copy built frontend to nginx directory
COPY --from=frontend-builder /app/frontend/build /var/lib/nginx/html

# Copy built backend JAR
COPY --from=backend-builder /app/backend/target/*.jar /app/ipter-backend.jar

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy application configuration
COPY docker/application-docker.properties /app/application.properties

# Copy startup script and make executable
COPY docker/start.sh /app/start.sh
RUN dos2unix /app/start.sh && \
    chmod +x /app/start.sh

# Set ownership
RUN chown -R ipter:ipter /app

# Expose ports
EXPOSE 80 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/actuator/health || exit 1

# Switch to application user
USER ipter

# Set working directory
WORKDIR /app

# Start the application
ENTRYPOINT ["/bin/sh"]
CMD ["/app/start.sh"]
