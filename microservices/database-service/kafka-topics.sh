#!/bin/bash

# Create Kafka topics for stock market events
docker exec kafka kafka-topics --create --topic market-data --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
docker exec kafka kafka-topics --create --topic orders --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1
docker exec kafka kafka-topics --create --topic alerts --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1
docker exec kafka kafka-topics --create --topic trades --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1

echo "Kafka topics created successfully"