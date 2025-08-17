#!/bin/bash

# IPTER Backend API Testing Script
BASE_URL="http://localhost:8080/api"

echo "🧪 IPTER Backend API Testing"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local description=$5
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "$headers" -H "Content-Type: application/json" -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "Content-Type: application/json" -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" -H "$headers")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ SUCCESS ($http_code)${NC}"
    else
        echo -e "${RED}❌ FAILED ($http_code)${NC}"
    fi
    
    echo "Response: $body"
    echo "----------------------------------------"
}

# 1. Health Check
test_endpoint "GET" "/actuator/health" "" "" "Health Check"

# 2. Application Info
test_endpoint "GET" "/actuator/info" "" "" "Application Info"

# 3. Session Info
test_endpoint "GET" "/auth/session-info" "" "" "Session Information"

# 4. Login with default admin
echo -e "\n${YELLOW}🔐 Authentication Tests${NC}"
login_data='{"username": "admin", "password": "admin123"}'
login_response=$(curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d "$login_data")
echo "Login Response: $login_response"

# Extract token from login response
token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Extracted Token: ${token:0:50}..."

if [ -n "$token" ]; then
    auth_header="Authorization: Bearer $token"
    
    # 5. Get current user
    test_endpoint "GET" "/auth/me" "" "$auth_header" "Get Current User"
    
    # 6. Validate token
    test_endpoint "POST" "/auth/validate" "" "$auth_header" "Validate Token"
    
    # 7. Refresh token
    refresh_response=$(curl -s -X POST "$BASE_URL/auth/refresh" -H "$auth_header")
    echo -e "\n${YELLOW}Token Refresh Response:${NC} $refresh_response"
    
    # 8. Register new user
    register_data='{"username": "testuser", "email": "test@example.com", "password": "password123", "role": "USER"}'
    test_endpoint "POST" "/auth/register" "$register_data" "" "Register New User"
    
    # 9. Login with new user
    new_login_data='{"username": "testuser", "password": "password123"}'
    test_endpoint "POST" "/auth/login" "$new_login_data" "" "Login New User"
    
    # 10. Logout
    test_endpoint "POST" "/auth/logout" "" "$auth_header" "Logout"
    
else
    echo -e "${RED}❌ Could not extract token from login response${NC}"
fi

# Error Testing
echo -e "\n${YELLOW}🚨 Error Testing${NC}"

# Invalid login
invalid_login='{"username": "admin", "password": "wrongpassword"}'
test_endpoint "POST" "/auth/login" "$invalid_login" "" "Invalid Login Credentials"

# Duplicate username
duplicate_user='{"username": "admin", "email": "admin2@test.com", "password": "password123"}'
test_endpoint "POST" "/auth/register" "$duplicate_user" "" "Duplicate Username Registration"

# Access protected endpoint without token
test_endpoint "GET" "/auth/me" "" "" "Access Protected Endpoint Without Token"

# Invalid token
test_endpoint "POST" "/auth/validate" "" "Authorization: Bearer invalid.token.here" "Invalid Token Validation"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo "Check the results above for any failures."
echo ""
echo "💡 Tips:"
echo "- Make sure the backend is running on http://localhost:8080"
echo "- Check the H2 console at http://localhost:8080/api/h2-console"
echo "- Default admin credentials: admin/admin123"
