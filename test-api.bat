@echo off
REM IPTER Backend API Testing Script for Windows
setlocal enabledelayedexpansion

set BASE_URL=http://localhost:8080/api

echo 🧪 IPTER Backend API Testing
echo ================================

echo.
echo 1. Testing Health Check...
curl -s -X GET "%BASE_URL%/actuator/health"
echo.

echo.
echo 2. Testing Application Info...
curl -s -X GET "%BASE_URL%/actuator/info"
echo.

echo.
echo 3. Testing Session Info...
curl -s -X GET "%BASE_URL%/auth/session-info"
echo.

echo.
echo 4. Testing Admin Login...
curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"admin123\"}" > login_response.tmp
type login_response.tmp
echo.

echo.
echo 5. Testing User Registration...
curl -s -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"email\": \"test@example.com\", \"password\": \"password123\", \"role\": \"USER\"}"
echo.

echo.
echo 6. Testing New User Login...
curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"username\": \"testuser\", \"password\": \"password123\"}"
echo.

echo.
echo 🚨 Error Testing
echo ================

echo.
echo 7. Testing Invalid Login...
curl -s -X POST "%BASE_URL%/auth/login" -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"password\": \"wrongpassword\"}"
echo.

echo.
echo 8. Testing Duplicate Username...
curl -s -X POST "%BASE_URL%/auth/register" -H "Content-Type: application/json" -d "{\"username\": \"admin\", \"email\": \"admin2@test.com\", \"password\": \"password123\"}"
echo.

echo.
echo 9. Testing Access Without Token...
curl -s -X GET "%BASE_URL%/auth/me"
echo.

echo.
echo 10. Testing Invalid Token...
curl -s -X POST "%BASE_URL%/auth/validate" -H "Authorization: Bearer invalid.token.here"
echo.

echo.
echo 🎉 API Testing Complete!
echo.
echo 💡 Tips:
echo - Make sure the backend is running on http://localhost:8080
echo - Check the H2 console at http://localhost:8080/api/h2-console
echo - Default admin credentials: admin/admin123
echo.

REM Clean up temporary files
if exist login_response.tmp del login_response.tmp

pause
