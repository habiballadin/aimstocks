#!/bin/bash

echo "Starting NiFi Data Ingestion Service..."

# Wait for TimescaleDB to be ready
echo "Waiting for TimescaleDB..."
until pg_isready -h timescaledb -p 5432 -U apiuser -d stockmarket; do
    echo "TimescaleDB is unavailable - sleeping"
    sleep 2
done
echo "✅ TimescaleDB is ready"

# Run symbol ingestion
echo "Running symbol ingestion..."
if ! python3 /app/scripts/symbol_ingestion.py; then
    echo "❌ Symbol ingestion failed"
    exit 1
fi

# Run historical data ingestion
echo "Running historical data ingestion..."
if ! python3 /app/scripts/historical_data_ingestion.py; then
    echo "❌ Historical data ingestion failed"
    exit 1
fi

echo "✅ NiFi ingestion completed"