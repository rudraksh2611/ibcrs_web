#!/bin/bash

# IBCRS - Start Script
# This script sets up and runs the IBCRS backend server

echo ""
echo "============================================"
echo "  IBCRS - Intelligent Biometric and Crop"
echo "           Recognition System"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "[1/3] Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        exit 1
    fi
    echo "Created successfully!"
fi

# Activate virtual environment
echo "[2/3] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate virtual environment"
    exit 1
fi
echo "Activated successfully!"

# Install dependencies
echo "[3/3] Installing dependencies..."
pip install -q -r backend/requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "Dependencies installed!"

# Start the application
echo ""
echo "============================================"
echo "Starting IBCRS Server..."
echo "============================================"
echo ""
echo "Server will run on: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python backend/app.py

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Server failed to start"
    exit 1
fi
