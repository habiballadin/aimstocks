# AimStocks Microservices Deployment Guide

## Prerequisites

1. **Docker & Docker Compose**: Install Docker Desktop
2. **Python 3.11+**: For local development
3. **MySQL 8.0**: Database (included in Docker setup)
4. **Fyers API Credentials**: Get from Fyers API portal

## Quick Start

### 1. Clone and Setup

```bash
cd /path/to/aimstocks/microservices
cp .env.example .env
# Edit .env with your actual credentials
```

### 2. Start All Services

```bash
./start-services.sh
```

This will:
- Build all Docker images
- Start all services
- Initialize the database
- Check service health

### 3. Verify Deployment

Visit http://localhost:8000/health to check API Gateway status.

Individual service health checks:
- User Service: http://localhost:8001/health
- Broker Service: http://localhost:8002/health
- Portfolio Service: http://localhost:8003/health
- Order Service: http://localhost:8004/health
- Market Data Service: http://localhost:8005/health
- Algorithm Service: http://localhost:8006/health
- Alert Service: http://localhost:8007/health
- News Service: http://localhost:8008/health
- WebSocket Service: http://localhost:8009/health

## Development Setup

### Run Individual Services Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=rootpass
export DB_NAME=aimstocks

# Start individual service
cd user-service
python main.py
```

### Database Setup

```bash
# Start only MySQL
docker-compose up mysql -d

# Run database initialization
mysql -h localhost -u root -p < ../database/init/01-init.sql
```

## Production Deployment

### 1. Environment Configuration

Create production `.env` file:

```bash
# Production environment variables
FYERS_CLIENT_ID=prod_client_id
FYERS_SECRET_KEY=prod_secret_key
JWT_SECRET=strong-production-jwt-secret
DB_HOST=prod-mysql-host
DB_PASSWORD=strong-db-password
```

### 2. Docker Compose Override

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  mysql:
    environment:
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
    volumes:
      - /data/mysql:/var/lib/mysql
  
  api-gateway:
    restart: always
    environment:
      - ENV=production
```

### 3. Deploy

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Scaling Services

### Scale Individual Services

```bash
# Scale market data service to 3 instances
docker-compose up --scale market-data-service=3 -d

# Scale algorithm service to 2 instances
docker-compose up --scale algorithm-service=2 -d
```

### Load Balancer Configuration

For production, add a load balancer (nginx/traefik) in front of services:

```yaml
# docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api-gateway
```

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service

# Last 100 lines
docker-compose logs --tail=100 algorithm-service
```

### Health Monitoring

```bash
# Check all service health
curl http://localhost:8000/health

# Monitor specific service
watch -n 5 'curl -s http://localhost:8005/health | jq'
```

## Backup & Recovery

### Database Backup

```bash
# Create backup
docker exec aimstocks-mysql mysqldump -u root -p aimstocks > backup.sql

# Restore backup
docker exec -i aimstocks-mysql mysql -u root -p aimstocks < backup.sql
```

### Service Configuration Backup

```bash
# Backup volumes
docker run --rm -v aimstocks_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-backup.tar.gz /data
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :8000
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Database Connection Issues**
   ```bash
   # Check MySQL container
   docker-compose logs mysql
   
   # Test connection
   docker exec -it aimstocks-mysql mysql -u root -p
   ```

3. **Service Dependencies**
   ```bash
   # Restart services in order
   docker-compose restart mysql
   docker-compose restart user-service broker-service
   docker-compose restart api-gateway
   ```

### Performance Tuning

1. **Database Optimization**
   - Add indexes for frequently queried columns
   - Configure MySQL memory settings
   - Use connection pooling

2. **Service Optimization**
   - Adjust worker processes in uvicorn
   - Configure async connection limits
   - Implement caching layers

3. **Resource Limits**
   ```yaml
   # docker-compose.yml
   services:
     user-service:
       deploy:
         resources:
           limits:
             memory: 512M
             cpus: '0.5'
   ```

## Security Considerations

1. **Environment Variables**: Never commit real credentials
2. **Network Security**: Use internal networks for service communication
3. **API Security**: Implement rate limiting and authentication
4. **Database Security**: Use strong passwords and limit access
5. **SSL/TLS**: Use HTTPS in production

## Migration from Monolith

To migrate your existing frontend to use microservices:

1. **Update API URLs**: Change from `http://localhost:5000` to `http://localhost:8000`
2. **Authentication**: Update to use JWT tokens from user service
3. **WebSocket**: Update WebSocket connections to use port 8009
4. **Error Handling**: Update to handle distributed system errors

The API Gateway maintains backward compatibility with your existing frontend routes.