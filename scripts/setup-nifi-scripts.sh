#!/bin/bash

echo "Setting up NiFi scripts..."

# Wait for NiFi to be ready
sleep 30

# Copy scripts to NiFi container
docker cp nifi/scripts/symbol_ingestion.py nifi-stock-ingestion:/opt/nifi/scripts/
docker cp nifi/scripts/historical_data_ingestion.py nifi-stock-ingestion:/opt/nifi/scripts/
docker cp nifi/scripts/requirements.txt nifi-stock-ingestion:/opt/nifi/scripts/

# Install Python dependencies
docker exec nifi-stock-ingestion pip install -r /opt/nifi/scripts/requirements.txt

echo "✅ NiFi scripts setup completed!"