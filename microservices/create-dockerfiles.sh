#!/bin/bash

# Create individual Dockerfiles for each service

services=("user" "broker" "portfolio" "order" "market-data" "algorithm" "alert" "news" "websocket")

for service in "${services[@]}"; do
    cat > "Dockerfile.$service" << EOF
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY shared/ ./shared/
COPY ${service}-service/ ./${service}-service/

ENV PYTHONPATH=/app

EXPOSE 800$(echo "$service" | wc -c | xargs expr 1 +)

CMD ["python", "${service}-service/main.py"]
EOF

    echo "Created Dockerfile.$service"
done

echo "All Dockerfiles created successfully!"