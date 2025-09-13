@echo off
REM IPTER Quick Deployment Script for Windows
REM This script helps users deploy IPTER quickly with minimal configuration

setlocal enabledelayedexpansion

echo 🚀 IPTER Quick Deployment Script
echo =================================
echo.

REM Check if Docker is installed and running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running
echo.

REM Configuration
set DOCKER_IMAGE=your-dockerhub-username/ipter:latest
set CONTAINER_NAME=ipter-application
set FRONTEND_PORT=80
set BACKEND_PORT=8080

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating environment configuration...
    
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo ✅ Created .env file from template
    ) else (
        REM Create basic .env file
        echo # IPTER Environment Configuration > .env
        echo GEMINI_API_KEY=your-gemini-api-key-here >> .env
        echo JWT_SECRET=your-secure-jwt-secret-here >> .env
        echo ✅ Created basic .env file
    )
    
    echo.
    echo ⚠️  IMPORTANT: You need to configure your environment variables!
    echo    Please edit the .env file and set:
    echo    - GEMINI_API_KEY: Your Google Gemini API key
    echo    - JWT_SECRET: A secure random string (32+ characters)
    echo.
    echo    You can generate a JWT secret with PowerShell:
    echo    [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
    echo.
    pause
    echo.
)

REM Simple validation (basic check)
findstr /C:"your-gemini-api-key-here" .env >nul
if not errorlevel 1 (
    echo ❌ GEMINI_API_KEY is not configured in .env file
    echo    Get your API key from: https://makersuite.google.com/app/apikey
    pause
    exit /b 1
)

findstr /C:"your-secure-jwt-secret-here" .env >nul
if not errorlevel 1 (
    echo ❌ JWT_SECRET is not configured in .env file
    echo    Generate one with PowerShell or use a random 32+ character string
    pause
    exit /b 1
)

echo ✅ Environment configuration validated
echo.

REM Check if ports are available (basic check)
netstat -an | findstr ":%FRONTEND_PORT% " >nul
if not errorlevel 1 (
    echo ⚠️  Port %FRONTEND_PORT% might be in use
    set /p continue="Do you want to continue anyway? (y/N): "
    if /i not "!continue!"=="y" exit /b 1
)

netstat -an | findstr ":%BACKEND_PORT% " >nul
if not errorlevel 1 (
    echo ⚠️  Port %BACKEND_PORT% might be in use
    set /p continue="Do you want to continue anyway? (y/N): "
    if /i not "!continue!"=="y" exit /b 1
)

REM Stop existing container if running
docker ps -q -f name=%CONTAINER_NAME% >nul 2>&1
if not errorlevel 1 (
    echo 🛑 Stopping existing IPTER container...
    docker stop %CONTAINER_NAME% >nul
    docker rm %CONTAINER_NAME% >nul
    echo ✅ Existing container stopped and removed
    echo.
)

REM Deployment method selection
echo 📦 Choose deployment method:
echo 1. Docker Compose (recommended)
echo 2. Docker Run (simple)
echo.
set /p choice="Enter your choice (1 or 2): "

if "%choice%"=="1" (
    REM Docker Compose deployment
    echo 🚀 Deploying with Docker Compose...
    
    if exist "docker-compose.yml" (
        docker-compose --version >nul 2>&1
        if not errorlevel 1 (
            docker-compose up -d
        ) else (
            docker compose up -d
        )
        echo ✅ IPTER deployed with Docker Compose
    ) else (
        echo ❌ docker-compose.yml not found
        echo    Please ensure you have the docker-compose.yml file in the current directory
        pause
        exit /b 1
    )
    
) else if "%choice%"=="2" (
    REM Docker Run deployment
    echo 🚀 Deploying with Docker Run...
    
    REM Read environment variables from .env file (simplified)
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if "%%a"=="GEMINI_API_KEY" set GEMINI_API_KEY=%%b
        if "%%a"=="JWT_SECRET" set JWT_SECRET=%%b
    )
    
    docker run -d ^
        --name %CONTAINER_NAME% ^
        -p %FRONTEND_PORT%:80 ^
        -p %BACKEND_PORT%:8080 ^
        -e GEMINI_API_KEY=!GEMINI_API_KEY! ^
        -e JWT_SECRET=!JWT_SECRET! ^
        -v ipter-data:/app/data ^
        -v ipter-uploads:/app/uploads ^
        -v ipter-processed:/app/processed ^
        -v ipter-reports:/app/reports ^
        -v ipter-thumbnails:/app/thumbnails ^
        -v ipter-logs:/app/logs ^
        --restart unless-stopped ^
        %DOCKER_IMAGE%
    
    echo ✅ IPTER deployed with Docker Run
) else (
    echo ❌ Invalid choice. Exiting.
    pause
    exit /b 1
)

echo.
echo ⏳ Waiting for IPTER to start...

REM Wait for the application to be ready
set /a counter=0
:wait_loop
set /a counter+=1
curl -s http://localhost:%BACKEND_PORT%/api/actuator/health >nul 2>&1
if not errorlevel 1 (
    echo ✅ IPTER is ready!
    goto :ready
)
if %counter% geq 30 (
    echo ⚠️  IPTER is taking longer than expected to start
    echo    Check the logs with: docker logs %CONTAINER_NAME%
    goto :ready
)
timeout /t 2 /nobreak >nul
echo|set /p="."
goto :wait_loop

:ready
echo.
echo 🎉 IPTER Deployment Complete!
echo ==============================
echo.
echo 📱 Access URLs:
echo    Frontend:     http://localhost:%FRONTEND_PORT%
echo    Backend API:  http://localhost:%BACKEND_PORT%/api
echo    Health Check: http://localhost:%BACKEND_PORT%/api/actuator/health
echo.
echo 🔐 Default Login:
echo    Username: admin
echo    Password: admin123
echo    ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!
echo.
echo 📊 Management Commands:
echo    View logs:    docker logs -f %CONTAINER_NAME%
echo    Stop IPTER:   docker stop %CONTAINER_NAME%
echo    Start IPTER:  docker start %CONTAINER_NAME%
echo    Remove IPTER: docker stop %CONTAINER_NAME% ^&^& docker rm %CONTAINER_NAME%
echo.
echo 🔧 Troubleshooting:
echo    If IPTER doesn't start, check the logs and ensure:
echo    - Your Gemini API key is valid and has quota
echo    - Ports %FRONTEND_PORT% and %BACKEND_PORT% are not in use by other applications
echo    - You have at least 2GB RAM available
echo.

REM Open browser (optional)
set /p open_browser="Do you want to open IPTER in your browser? (y/N): "
if /i "%open_browser%"=="y" (
    start http://localhost:%FRONTEND_PORT%
)

echo.
echo Thank you for using IPTER! 🚀
pause
