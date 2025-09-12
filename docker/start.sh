#!/bin/sh

# IPTER Application Startup Script
# This script starts both nginx (frontend) and the Spring Boot backend

set -e

echo "Starting IPTER Application..."

# Function to handle shutdown gracefully
shutdown() {
    echo "Shutting down IPTER Application..."
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ ! -z "$NGINX_PID" ]; then
        echo "Stopping nginx (PID: $NGINX_PID)..."
        kill -TERM "$NGINX_PID" 2>/dev/null || true
        wait "$NGINX_PID" 2>/dev/null || true
    fi
    echo "IPTER Application stopped."
    exit 0
}

# Set up signal handlers
trap shutdown TERM INT

# Create necessary directories if they don't exist
mkdir -p /app/data /app/uploads /app/processed /app/reports /app/thumbnails /app/logs
mkdir -p /tmp/nginx /var/lib/nginx/tmp/client_body /var/lib/nginx/tmp/proxy /var/lib/nginx/tmp/fastcgi /var/lib/nginx/tmp/uwsgi /var/lib/nginx/tmp/scgi

# Set permissions
chmod -R 755 /app/data /app/uploads /app/processed /app/reports /app/thumbnails /app/logs
chmod -R 755 /tmp/nginx /var/lib/nginx/tmp

# Start nginx in the background
echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!
echo "Nginx started with PID: $NGINX_PID"

# Wait a moment for nginx to start
sleep 2

# Start the Spring Boot backend
echo "Starting IPTER Backend..."
cd /app

# Set JVM options for container environment
export JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseContainerSupport"

# Start the backend application
java $JAVA_OPTS \
    -Dspring.config.location=file:/app/application.properties \
    -Dspring.profiles.active=docker \
    -Dlogging.file.path=/app/logs \
    -Dfile.encoding=UTF-8 \
    -Djava.awt.headless=true \
    -jar /app/ipter-backend.jar &

BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for both processes
echo "IPTER Application is running..."
echo "Frontend (nginx): http://localhost:80"
echo "Backend API: http://localhost:8080"
echo "Health check: http://localhost:8080/api/actuator/health"

# Wait for either process to exit
wait $BACKEND_PID $NGINX_PID

# If we reach here, one of the processes has exited
echo "One of the processes has exited. Shutting down..."
shutdown
