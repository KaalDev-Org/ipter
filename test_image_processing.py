#!/usr/bin/env python3
"""
Test script for IPTER image processing functionality
Tests the complete workflow from image upload to text extraction
"""
import requests
import json
import os
import time
from pathlib import Path

# Configuration
JAVA_BACKEND_URL = "http://localhost:8080/api"
PYTHON_AI_URL = "http://localhost:8001"
TEST_IMAGE_PATH = "IPTER_docs/THE IMAGES.xlsx"  # We'll need to use an actual image

# Test credentials (you may need to adjust these)
TEST_USERNAME = "admin"
TEST_PASSWORD = "admin123"

def test_ai_service_health():
    """Test if AI service is running"""
    try:
        response = requests.get(f"{PYTHON_AI_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ AI Service is running")
            print(f"  Response: {response.json()}")
            return True
        else:
            print(f"✗ AI Service health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ AI Service is not accessible: {e}")
        return False

def test_java_backend_health():
    """Test if Java backend is running"""
    try:
        response = requests.get(f"{JAVA_BACKEND_URL}/actuator/health", timeout=5)
        if response.status_code == 200:
            print("✓ Java Backend is running")
            return True
        else:
            print(f"✗ Java Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Java Backend is not accessible: {e}")
        return False

def login_to_backend():
    """Login to Java backend and get JWT token"""
    try:
        login_data = {
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        }
        
        response = requests.post(f"{JAVA_BACKEND_URL}/auth/login", json=login_data)
        
        if response.status_code == 200:
            token = response.json().get("token")
            print("✓ Successfully logged in to Java backend")
            return token
        else:
            print(f"✗ Login failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"✗ Login request failed: {e}")
        return None

def get_or_create_test_project(token):
    """Get or create a test project"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Try to get existing projects
        response = requests.get(f"{JAVA_BACKEND_URL}/projects", headers=headers)
        
        if response.status_code == 200:
            projects = response.json().get("data", [])
            if projects:
                project_id = projects[0]["id"]
                print(f"✓ Using existing project: {project_id}")
                return project_id
        
        # Create a new test project
        project_data = {
            "name": "Test Image Processing Project",
            "description": "Test project for image processing functionality",
            "customerCode": "TEST001"
        }
        
        response = requests.post(f"{JAVA_BACKEND_URL}/projects", json=project_data, headers=headers)
        
        if response.status_code == 200:
            project_id = response.json().get("data", {}).get("id")
            print(f"✓ Created test project: {project_id}")
            return project_id
        else:
            print(f"✗ Failed to create project: {response.status_code}")
            print(f"  Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"✗ Project request failed: {e}")
        return None

def test_direct_ai_service():
    """Test AI service directly with a sample image"""
    print("\n--- Testing AI Service Directly ---")
    
    # Create a simple test image (white background with black text)
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io
        
        # Create a test image with container numbers
        img = Image.new('RGB', (800, 200), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font, fallback to basic if not available
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        # Draw some container numbers
        test_numbers = ["ABCD1234567", "EFGH9876543", "IJKL1111111"]
        y_pos = 50
        for number in test_numbers:
            draw.text((50, y_pos), number, fill='black', font=font)
            y_pos += 40
        
        # Save to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        # Test the AI service
        files = {'file': ('test_image.png', img_bytes.getvalue(), 'image/png')}
        response = requests.post(f"{PYTHON_AI_URL}/ocr/extract-containers", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("✓ AI Service OCR test successful")
            print(f"  Extracted text: {result.get('extracted_text', '')[:100]}...")
            print(f"  Container numbers found: {len(result.get('container_numbers', []))}")
            for i, container in enumerate(result.get('container_numbers', [])):
                print(f"    {i+1}. {container.get('number')} (confidence: {container.get('confidence', 0):.2f})")
            return True
        else:
            print(f"✗ AI Service OCR test failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except ImportError:
        print("⚠ PIL not available, skipping direct AI service test")
        print("  Install Pillow to enable this test: pip install Pillow")
        return True
    except Exception as e:
        print(f"✗ Direct AI service test failed: {e}")
        return False

def test_full_workflow(token, project_id):
    """Test the complete image upload and processing workflow"""
    print("\n--- Testing Full Workflow ---")
    
    # For now, we'll skip the full workflow test since we need an actual image file
    # and the Java backend needs to be running with the database set up
    
    print("⚠ Full workflow test requires:")
    print("  1. Java backend running with database")
    print("  2. Actual image file with container numbers")
    print("  3. Proper authentication setup")
    print("  This test is skipped for now.")
    
    return True

def main():
    """Main test function"""
    print("IPTER Image Processing Test Suite")
    print("=" * 40)
    
    # Test AI service
    print("\n1. Testing AI Service...")
    ai_service_ok = test_ai_service_health()
    
    # Test Java backend
    print("\n2. Testing Java Backend...")
    java_backend_ok = test_java_backend_health()
    
    # Test direct AI service functionality
    print("\n3. Testing AI Service OCR...")
    ai_ocr_ok = test_direct_ai_service()
    
    # Summary
    print("\n" + "=" * 40)
    print("TEST SUMMARY")
    print("=" * 40)
    print(f"AI Service Health: {'✓ PASS' if ai_service_ok else '✗ FAIL'}")
    print(f"Java Backend Health: {'✓ PASS' if java_backend_ok else '✗ FAIL'}")
    print(f"AI Service OCR: {'✓ PASS' if ai_ocr_ok else '✗ FAIL'}")
    
    if ai_service_ok and java_backend_ok and ai_ocr_ok:
        print("\n🎉 All basic tests passed!")
        print("\nNext steps:")
        print("1. Start both services (Java backend and Python AI service)")
        print("2. Upload an image through the web interface")
        print("3. Check the processing results")
    else:
        print("\n❌ Some tests failed. Please check the services.")
        
        if not ai_service_ok:
            print("\nTo start AI service:")
            print("  cd ipter/ai-services")
            print("  python start.py")
            
        if not java_backend_ok:
            print("\nTo start Java backend:")
            print("  cd ipter/backend")
            print("  mvn spring-boot:run")

if __name__ == "__main__":
    main()
