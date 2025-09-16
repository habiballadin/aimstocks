#!/bin/bash

echo "🔄 Switching back to Monolithic Backend..."

# Stop microservices
echo "Stopping microservices..."
cd microservices
docker-compose down 2>/dev/null || true
cd ..

# Start monolithic backend
echo "Starting monolithic backend..."
cd python-backend
python main.py &

echo "✅ Switched back to monolithic backend!"
echo "🌐 Frontend can connect to: http://127.0.0.1:5000"