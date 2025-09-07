# IPTER - Setup Guide for Testing

## What You Need to Test IPTER

IPTER is an application that helps extract container numbers from images and PDF files. This guide will help you get it running on your computer for testing.

## Computer Requirements

### What Your Computer Needs
- **Memory (RAM)**: At least 8 GB
- **Storage Space**: At least 5 GB of free space
- **Operating System**:
  - Windows 10 or Windows 11
  - Mac (macOS 10.15 or newer)
  - Linux (Ubuntu 18 or newer)
- **Internet Connection**: Required for the AI features to work

## What Software You Need to Install

Don't worry - we'll guide you through installing everything step by step!

### Required Programs
1. **Java 17** - The main engine that runs the application
2. **Node.js** - Needed to run the web interface
3. **A Web Browser** - Chrome, Firefox, Safari, or Edge (recent versions)

## Step-by-Step Installation

### Step 1: Install Java 17

Java is the main program that runs IPTER.

#### For Windows:
1. Go to [https://adoptium.net/](https://adoptium.net/)
2. Click "Download" for Java 17 (LTS)
3. Download the Windows installer (.msi file)
4. Run the installer and follow the setup wizard
5. Keep all default settings

#### For Mac:
1. Go to [https://adoptium.net/](https://adoptium.net/)
2. Click "Download" for Java 17 (LTS)
3. Download the macOS installer (.pkg file)
4. Run the installer and follow the setup wizard

#### For Linux (Ubuntu):
1. Open Terminal
2. Type: `sudo apt update`
3. Type: `sudo apt install openjdk-17-jdk`
4. Press Enter and wait for installation to complete

### Step 2: Install Node.js

Node.js runs the web interface of IPTER.

#### For All Operating Systems:
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the "LTS" version (recommended for most users)
3. Run the installer
4. Keep all default settings during installation

## Running IPTER for Testing

### Step 3: Get the IPTER Application Files

You should have received the IPTER application folder. Make sure you have:
- A folder named "ipter"
- Inside it, you should see folders named "backend" and "frontend"

### Step 4: Start the Application

#### Part A: Start the Backend (Main Application)

1. **Open Command Prompt or Terminal**
   - Windows: Press Windows key + R, type "cmd", press Enter
   - Mac: Press Cmd + Space, type "Terminal", press Enter
   - Linux: Press Ctrl + Alt + T

2. **Navigate to the backend folder**
   - Type: `cd path/to/ipter/backend` (replace "path/to" with the actual location)
   - Example: `cd C:\Users\YourName\Desktop\ipter\backend`

3. **Start the backend**
   - Type: `mvn spring-boot:run`
   - Press Enter and wait (this may take a few minutes the first time)
   - You'll see lots of text. Wait until you see "Started IpterApplication"

#### Part B: Start the Frontend (Web Interface)

1. **Open a NEW Command Prompt or Terminal window** (keep the first one running)

2. **Navigate to the frontend folder**
   - Type: `cd path/to/ipter/frontend` (replace "path/to" with the actual location)
   - Example: `cd C:\Users\YourName\Desktop\ipter\frontend`

3. **Install required components** (only needed the first time)
   - Type: `npm install`
   - Press Enter and wait for completion

4. **Start the web interface**
   - Type: `npm start`
   - Press Enter and wait
   - Your web browser should automatically open to the application

## Using IPTER

### Step 5: Access the Application

1. **Open your web browser** (Chrome, Firefox, Safari, or Edge)
2. **Go to**: `http://localhost:3000`
3. **You should see the IPTER login page**

### Step 6: Login and Test

1. **Default login credentials:**
   - Username: `admin`
   - Password: `admin123`

2. **What you can test:**
   - Upload images with container numbers
   - Upload PDF files with container information
   - View extracted container numbers
   - Download results

### Important Notes

- **Keep both command windows open** while testing - closing them will stop the application
- **Internet connection required** - The AI features need internet to work
- **Supported file types**: JPG, PNG, BMP, TIFF images and PDF files
- **Maximum file size**: 1MB per file

## How to Know Everything is Working

### Check if the Backend is Running
- Look at the first command window - you should see "Started IpterApplication"
- The window should show it's running on port 8080

### Check if the Frontend is Working
- Your web browser should automatically open to `http://localhost:3000`
- You should see the IPTER login screen
- If the browser doesn't open automatically, manually go to `http://localhost:3000`

### Test the Login
- Use username: `admin` and password: `admin123`
- If login works, you'll see the main application screen

## Common Problems and Solutions

### Problem: "Command not found" or "java is not recognized"
**Solution:** Java wasn't installed correctly
- Go back to Step 1 and reinstall Java
- Restart your computer after installation
- Try the command again

### Problem: "Port 8080 is already in use"
**Solution:** Something else is using that port
- Close any other applications that might be running
- Restart your computer
- Try running the application again

### Problem: The web page won't load at localhost:3000
**Solution:** The frontend isn't running properly
- Make sure you ran `npm install` first
- Check that the second command window is still open and running
- Try refreshing the web page

### Problem: "Cannot connect to backend" or login doesn't work
**Solution:** The backend isn't running properly
- Make sure the first command window is still open and running
- Look for "Started IpterApplication" in the first window
- If you don't see it, close the window and start over from Step 4A

### Problem: File upload fails or AI features don't work
**Solution:** Internet connection or file issues
- Check your internet connection
- Make sure your file is under 1MB
- Try with a different image or PDF file


## Stopping the Application

When you're done testing:
1. Close your web browser
2. In both command windows, press **Ctrl+C** (Windows/Linux) or **Cmd+C** (Mac)
3. Close both command windows

The application will stop running and free up your computer's resources.
