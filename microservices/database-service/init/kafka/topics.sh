#!/bin/bash
# Kafka topic creation script for AimStocks

# Wait for Kafka to be ready
sleep 30

# Create topics
kafka-topics.sh --create --topic market-data --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic order-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics.sh --create --topic user-events --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1
kafka-topics.sh --create --topic alerts --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1
kafka-topics.sh --create --topic portfolio-updates --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1
kafka-topics.sh --create --topic notifications --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1

echo "Kafka topics created successfully"