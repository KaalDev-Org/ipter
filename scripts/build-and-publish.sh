#!/bin/bash

# IPTER Docker Image Build and Publish Script
# This script builds the IPTER Docker image and publishes it to Docker Hub

set -e

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-your-dockerhub-username}"
IMAGE_NAME="ipter"
VERSION="${VERSION:-latest}"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

echo "🚀 Building and Publishing IPTER Docker Image"
echo "=============================================="
echo "Docker Username: $DOCKER_USERNAME"
echo "Image Name: $IMAGE_NAME"
echo "Version: $VERSION"
echo "Full Image Name: $FULL_IMAGE_NAME"
echo ""

# Step 1: Build the Docker image
echo "📦 Step 1: Building Docker image..."
docker build -t $FULL_IMAGE_NAME .

# Also tag as latest if not already latest
if [ "$VERSION" != "latest" ]; then
    docker tag $FULL_IMAGE_NAME ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    echo "✅ Tagged as both $VERSION and latest"
else
    echo "✅ Tagged as latest"
fi

# Step 2: Test the image locally (optional)
echo ""
echo "🧪 Step 2: Testing image locally (optional)..."
echo "You can test the image with:"
echo "docker run -p 80:80 -p 8080:8080 $FULL_IMAGE_NAME"
echo ""
read -p "Do you want to test the image locally first? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting test container..."
    docker run -d --name ipter-test -p 80:80 -p 8080:8080 $FULL_IMAGE_NAME
    echo "✅ Test container started. Check http://localhost:80"
    echo "Press any key to continue with publishing (this will stop the test container)..."
    read -n 1 -s
    docker stop ipter-test
    docker rm ipter-test
    echo "Test container stopped and removed."
fi

# Step 3: Login to Docker Hub
echo ""
echo "🔐 Step 3: Docker Hub Authentication..."
echo "Please login to Docker Hub:"
docker login

# Step 4: Push the image
echo ""
echo "📤 Step 4: Pushing image to Docker Hub..."
docker push $FULL_IMAGE_NAME

if [ "$VERSION" != "latest" ]; then
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:latest
    echo "✅ Pushed both $VERSION and latest tags"
else
    echo "✅ Pushed latest tag"
fi

echo ""
echo "🎉 SUCCESS! IPTER Docker image published successfully!"
echo "=============================================="
echo "Image available at: https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
echo "Pull command: docker pull $FULL_IMAGE_NAME"
echo ""
echo "Users can now deploy IPTER with:"
echo "docker run -p 80:80 -p 8080:8080 $FULL_IMAGE_NAME"
echo ""
