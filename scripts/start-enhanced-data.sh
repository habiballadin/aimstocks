#!/bin/bash

# Start enhanced market data system with yfinance

echo "🚀 Starting Enhanced Market Data System..."

cd python-backend

# Install yfinance and dependencies
echo "📦 Installing yfinance..."
pip install yfinance websockets aiohttp

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=aimstocks
export DB_USER=aimstocks_user
export DB_PASSWORD=aimstocks_password

echo "📊 Starting market data ingestion..."
python enhanced_market_data.py &

echo "🌐 Starting WebSocket streaming server..."
python websocket_streaming.py &

echo "✅ Enhanced market data system started!"
echo "📡 WebSocket server: ws://localhost:8765"
echo "📈 Market data updating every 30 seconds"

# Keep script running
wait