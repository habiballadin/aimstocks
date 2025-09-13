#!/bin/bash

echo "Setting up Apache Spark for Stock Market Analysis..."

# Build and start Docker containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 45

# Create database tables
echo "Setting up database tables..."
docker exec mysql-db mysql -u spark -psparkpass stockmarket -e "
CREATE TABLE IF NOT EXISTS stock_prices (
    Date DATE,
    Open DOUBLE,
    High DOUBLE,
    Low DOUBLE,
    Close DOUBLE,
    Volume BIGINT,
    Symbol VARCHAR(20),
    Timestamp TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_analysis (
    Date DATE,
    Open DOUBLE,
    High DOUBLE,
    Low DOUBLE,
    Close DOUBLE,
    Volume BIGINT,
    Symbol VARCHAR(20),
    Timestamp TIMESTAMP,
    SMA_20 DOUBLE,
    Price_Change DOUBLE,
    Price_Change_Pct DOUBLE
);

CREATE TABLE IF NOT EXISTS market_summary (
    Symbol VARCHAR(20) PRIMARY KEY,
    Latest_Price DOUBLE,
    Price_Change DOUBLE,
    Price_Change_Pct DOUBLE,
    Volume BIGINT,
    SMA_20 DOUBLE
);

CREATE TABLE IF NOT EXISTS volatility_analysis (
    Symbol VARCHAR(20) PRIMARY KEY,
    Current_Volatility DOUBLE,
    Avg_Daily_Return DOUBLE,
    Overall_Volatility DOUBLE
);

CREATE TABLE IF NOT EXISTS market_trends (
    Symbol VARCHAR(20) PRIMARY KEY,
    Trading_Days BIGINT,
    Avg_Volume DOUBLE,
    Period_High DOUBLE,
    Period_Low DOUBLE,
    Price_Range DOUBLE,
    Current_Price DOUBLE,
    Price_Position DOUBLE
);
"

echo "Setup completed!"
echo "Access points:"
echo "- Spark Master UI: http://localhost:8080"
echo "- Jupyter Notebook: http://localhost:8888"
echo "- Stock Market API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo "- MySQL: localhost:3306 (user: spark, password: sparkpass, db: stockmarket)"
echo ""
echo "To run data ingestion: docker exec spark-master spark-submit /opt/bitnami/spark/apps/stock_ingestion.py"
echo "To run analysis: docker exec spark-master spark-submit /opt/bitnami/spark/apps/stock_analysis.py"