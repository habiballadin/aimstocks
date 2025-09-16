#!/bin/bash

echo "🚀 Starting AimStocks Microservices..."

# Stop any existing python backend
echo "Stopping existing Python backend..."
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "uvicorn.*main:app" 2>/dev/null || true

# Navigate to microservices directory
cd microservices

# Start microservices
echo "Starting microservices..."
./start-services.sh

echo "✅ Microservices started successfully!"
echo "🌐 Frontend can now connect to: http://127.0.0.1:5000"