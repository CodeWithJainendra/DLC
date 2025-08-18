#!/bin/bash

# 🐍 Python Backend Startup Script for Pension Management System

echo "🚀 Starting Pension Management System Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7 or higher."
    exit 1
fi

# Navigate to backend directory
cd backend

# Start the simple Python server (no dependencies required)
echo "🌟 Starting Simple Python HTTP server..."
echo "📊 Using built-in Python libraries only"
echo ""

python3 simple_app.py
