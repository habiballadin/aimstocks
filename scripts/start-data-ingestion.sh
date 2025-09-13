#!/bin/bash

# Start real-time market data ingestion

echo "🚀 Starting Market Data Ingestion..."

# Check if Python backend directory exists
if [ ! -d "python-backend" ]; then
    echo "❌ Python backend directory not found"
    exit 1
fi

cd python-backend

# Install required packages
echo "📦 Installing required packages..."
pip install -r requirements.txt 2>/dev/null || pip install aiohttp yfinance pandas mysql-connector-python python-dotenv

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=aimstocks
export DB_USER=aimstocks_user
export DB_PASSWORD=aimstocks_password

# Run market data ingestion
echo "📊 Starting market data ingestion..."
python market_data_ingestion.py

echo "✅ Market data ingestion completed!"