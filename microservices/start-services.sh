#!/bin/bash

# AimStocks Microservices Startup Script

echo "Starting AimStocks Microservices..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
FYERS_CLIENT_ID=your_fyers_client_id
FYERS_SECRET_KEY=your_fyers_secret_key
FYERS_REDIRECT_URI=http://127.0.0.1:5000/fyers/callback
JWT_SECRET=your-jwt-secret-key-change-this-in-production
EOF
    echo "Please update the .env file with your actual Fyers credentials"
fi

# Start database services
echo "Starting database services..."
docker-compose -f database-service/docker-compose.yml up -d

# Build and start services
echo "Building and starting services..."
docker-compose -f docker-compose.common.yml -f docker-compose.database.yml -f docker-compose.api-gateway.yml -f docker-compose.user-services.yml -f docker-compose.other-services.yml up --build -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Check service health
echo "Checking service health..."
services=("api-gateway:5000" "user-service:8001" "broker-service:8002" "portfolio-service:8003" "order-service:8004" "market-data-service:8005" "algorithm-service:8006" "alert-service:8007" "news-service:8008" "websocket-service:8009")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d':' -f1)
    port=$(echo $service | cut -d':' -f2)
    
    if curl -s http://127.0.0.1:$port/health > /dev/null; then
        echo "✓ $name is healthy"
    else
        echo "✗ $name is not responding"
    fi
done

echo ""
echo "AimStocks Microservices are running!"
echo ""
echo "API Gateway: http://127.0.0.1:5000"
echo "Services:"
echo "  - User Service: http://127.0.0.1:8001"
echo "  - Broker Service: http://127.0.0.1:8002"
echo "  - Portfolio Service: http://127.0.0.1:8003"
echo "  - Order Service: http://127.0.0.1:8004"
echo "  - Market Data Service: http://127.0.0.1:8005"
echo "  - Algorithm Service: http://127.0.0.1:8006"
echo "  - Alert Service: http://127.0.0.1:8007"
echo "  - News Service: http://127.0.0.1:8008"
echo "  - WebSocket Service: http://127.0.0.1:8009"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs: docker-compose logs -f [service-name]"