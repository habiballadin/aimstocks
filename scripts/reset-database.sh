#!/bin/bash

# Reset AimStocks database - removes all data and recreates fresh

echo "🔄 Resetting AimStocks database..."

# Stop and remove existing container
echo "🛑 Stopping existing containers..."
docker-compose down -v

# Start fresh MySQL container
echo "🚀 Starting fresh MySQL container..."
docker-compose up -d mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to initialize..."
sleep 20

echo "✅ Database reset completed!"
echo "🔧 Run './scripts/setup-database.sh' to setup the complete database"