#!/bin/bash

# IPTER Quick Deployment Script
# This script helps users deploy IPTER quickly with minimal configuration

set -e

echo "🚀 IPTER Quick Deployment Script"
echo "================================="
echo ""

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed and running"
echo ""

# Configuration
DOCKER_IMAGE="your-dockerhub-username/ipter:latest"  # Replace with actual image
CONTAINER_NAME="ipter-application"
FRONTEND_PORT="80"
BACKEND_PORT="8080"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating environment configuration..."
    
    # Create .env file from template
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from template"
    else
        # Create basic .env file
        cat > .env << EOF
# IPTER Environment Configuration
GEMINI_API_KEY=your-gemini-api-key-here
JWT_SECRET=your-secure-jwt-secret-here
EOF
        echo "✅ Created basic .env file"
    fi
    
    echo ""
    echo "⚠️  IMPORTANT: You need to configure your environment variables!"
    echo "   Please edit the .env file and set:"
    echo "   - GEMINI_API_KEY: Your Google Gemini API key"
    echo "   - JWT_SECRET: A secure random string (32+ characters)"
    echo ""
    echo "   You can generate a JWT secret with:"
    echo "   openssl rand -base64 32"
    echo ""
    read -p "Press Enter after you've configured the .env file..."
    echo ""
fi

# Validate required environment variables
source .env

if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your-gemini-api-key-here" ]; then
    echo "❌ GEMINI_API_KEY is not configured in .env file"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-secure-jwt-secret-here" ]; then
    echo "❌ JWT_SECRET is not configured in .env file"
    echo "   Generate one with: openssl rand -base64 32"
    exit 1
fi

echo "✅ Environment configuration validated"
echo ""

# Check if ports are available
if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $FRONTEND_PORT is already in use"
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $BACKEND_PORT is already in use"
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Stop existing container if running
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    echo "🛑 Stopping existing IPTER container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    echo "✅ Existing container stopped and removed"
    echo ""
fi

# Deployment method selection
echo "📦 Choose deployment method:"
echo "1. Docker Compose (recommended)"
echo "2. Docker Run (simple)"
echo ""
read -p "Enter your choice (1 or 2): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[1]$ ]]; then
    # Docker Compose deployment
    echo "🚀 Deploying with Docker Compose..."
    
    if [ -f "docker-compose.yml" ]; then
        # Use docker-compose or docker compose based on availability
        if command -v docker-compose &> /dev/null; then
            docker-compose up -d
        else
            docker compose up -d
        fi
        echo "✅ IPTER deployed with Docker Compose"
    else
        echo "❌ docker-compose.yml not found"
        echo "   Please ensure you have the docker-compose.yml file in the current directory"
        exit 1
    fi
    
elif [[ $REPLY =~ ^[2]$ ]]; then
    # Docker Run deployment
    echo "🚀 Deploying with Docker Run..."
    
    docker run -d \
        --name $CONTAINER_NAME \
        -p $FRONTEND_PORT:80 \
        -p $BACKEND_PORT:8080 \
        -e GEMINI_API_KEY="$GEMINI_API_KEY" \
        -e JWT_SECRET="$JWT_SECRET" \
        -v ipter-data:/app/data \
        -v ipter-uploads:/app/uploads \
        -v ipter-processed:/app/processed \
        -v ipter-reports:/app/reports \
        -v ipter-thumbnails:/app/thumbnails \
        -v ipter-logs:/app/logs \
        --restart unless-stopped \
        $DOCKER_IMAGE
    
    echo "✅ IPTER deployed with Docker Run"
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "⏳ Waiting for IPTER to start..."

# Wait for the application to be ready
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/api/actuator/health > /dev/null 2>&1; then
        echo "✅ IPTER is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "⚠️  IPTER is taking longer than expected to start"
        echo "   Check the logs with: docker logs $CONTAINER_NAME"
        break
    fi
    sleep 2
    echo -n "."
done

echo ""
echo "🎉 IPTER Deployment Complete!"
echo "=============================="
echo ""
echo "📱 Access URLs:"
echo "   Frontend:    http://localhost:$FRONTEND_PORT"
echo "   Backend API: http://localhost:$BACKEND_PORT/api"
echo "   Health Check: http://localhost:$BACKEND_PORT/api/actuator/health"
echo ""
echo "🔐 Default Login:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!"
echo ""
echo "📊 Management Commands:"
echo "   View logs:    docker logs -f $CONTAINER_NAME"
echo "   Stop IPTER:   docker stop $CONTAINER_NAME"
echo "   Start IPTER:  docker start $CONTAINER_NAME"
echo "   Remove IPTER: docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
echo ""
echo "🔧 Troubleshooting:"
echo "   If IPTER doesn't start, check the logs and ensure:"
echo "   - Your Gemini API key is valid and has quota"
echo "   - Ports $FRONTEND_PORT and $BACKEND_PORT are not in use by other applications"
echo "   - You have at least 2GB RAM available"
echo ""

# Open browser (optional)
read -p "Do you want to open IPTER in your browser? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:$FRONTEND_PORT
    elif command -v open &> /dev/null; then
        open http://localhost:$FRONTEND_PORT
    else
        echo "Please open http://localhost:$FRONTEND_PORT in your browser"
    fi
fi

echo ""
echo "Thank you for using IPTER! 🚀"
