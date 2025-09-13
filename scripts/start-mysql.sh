#!/bin/bash

# Start MySQL Docker container for AimStocks

echo "Starting MySQL container for AimStocks..."

# Stop existing container if running
docker-compose -f docker-compose.mysql.yml down

# Start MySQL container
docker-compose -f docker-compose.mysql.yml up -d mysql

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
sleep 15

# Grant permissions for external connections
echo "Setting up user permissions..."
docker exec mysql-db mysql -u root -prootpass -e "CREATE USER IF NOT EXISTS 'spark'@'%' IDENTIFIED BY 'sparkpass'; GRANT ALL PRIVILEGES ON *.* TO 'spark'@'%'; FLUSH PRIVILEGES;"

# Check if MySQL is running
if docker-compose -f docker-compose.mysql.yml ps mysql | grep -q "Up"; then
    echo "✅ MySQL container is running successfully!"
    echo "📊 Database: stockmarket"
    echo "🔗 Connection: localhost:3306"
    echo "👤 User: spark"
    echo "🔑 Password: sparkpass"
    echo ""
    echo "To connect to MySQL:"
    echo "mysql -h localhost -P 3306 -u spark -psparkpass stockmarket"
else
    echo "❌ Failed to start MySQL container"
    exit 1
fi