@echo off
REM IPTER Docker Image Build and Publish Script for Windows
REM This script builds the IPTER Docker image and publishes it to Docker Hub

setlocal enabledelayedexpansion

REM Configuration
if "%DOCKER_USERNAME%"=="" set DOCKER_USERNAME=your-dockerhub-username
set IMAGE_NAME=ipter
if "%VERSION%"=="" set VERSION=latest
set FULL_IMAGE_NAME=%DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%

echo 🚀 Building and Publishing IPTER Docker Image
echo ==============================================
echo Docker Username: %DOCKER_USERNAME%
echo Image Name: %IMAGE_NAME%
echo Version: %VERSION%
echo Full Image Name: %FULL_IMAGE_NAME%
echo.

REM Step 1: Build the Docker image
echo 📦 Step 1: Building Docker image...
docker build -t %FULL_IMAGE_NAME% .
if errorlevel 1 (
    echo ❌ Docker build failed!
    exit /b 1
)

REM Also tag as latest if not already latest
if not "%VERSION%"=="latest" (
    docker tag %FULL_IMAGE_NAME% %DOCKER_USERNAME%/%IMAGE_NAME%:latest
    echo ✅ Tagged as both %VERSION% and latest
) else (
    echo ✅ Tagged as latest
)

REM Step 2: Test the image locally (optional)
echo.
echo 🧪 Step 2: Testing image locally (optional)...
echo You can test the image with:
echo docker run -p 80:80 -p 8080:8080 %FULL_IMAGE_NAME%
echo.
set /p test_choice="Do you want to test the image locally first? (y/N): "
if /i "%test_choice%"=="y" (
    echo Starting test container...
    docker run -d --name ipter-test -p 80:80 -p 8080:8080 %FULL_IMAGE_NAME%
    echo ✅ Test container started. Check http://localhost:80
    echo Press any key to continue with publishing (this will stop the test container)...
    pause >nul
    docker stop ipter-test
    docker rm ipter-test
    echo Test container stopped and removed.
)

REM Step 3: Login to Docker Hub
echo.
echo 🔐 Step 3: Docker Hub Authentication...
echo Please login to Docker Hub:
docker login
if errorlevel 1 (
    echo ❌ Docker login failed!
    exit /b 1
)

REM Step 4: Push the image
echo.
echo 📤 Step 4: Pushing image to Docker Hub...
docker push %FULL_IMAGE_NAME%
if errorlevel 1 (
    echo ❌ Docker push failed!
    exit /b 1
)

if not "%VERSION%"=="latest" (
    docker push %DOCKER_USERNAME%/%IMAGE_NAME%:latest
    echo ✅ Pushed both %VERSION% and latest tags
) else (
    echo ✅ Pushed latest tag
)

echo.
echo 🎉 SUCCESS! IPTER Docker image published successfully!
echo ==============================================
echo Image available at: https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo Pull command: docker pull %FULL_IMAGE_NAME%
echo.
echo Users can now deploy IPTER with:
echo docker run -p 80:80 -p 8080:8080 %FULL_IMAGE_NAME%
echo.

pause
