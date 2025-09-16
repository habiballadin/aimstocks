# AimStocks Database Service

Multi-database setup for the AimStocks trading platform with TimescaleDB, Redis, ClickHouse, and Kafka.

## Architecture

- **TimescaleDB**: Primary transactional database + time-series market data
- **Redis**: Session management, caching, real-time data
- **ClickHouse**: Analytics and historical data warehouse
- **Kafka**: Event streaming and message queuing

## Quick Start

```bash
# Start all databases
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f timescaledb
```

## Database Schemas

### TimescaleDB (Port 5434)
- Users, portfolios, holdings, orders
- Real-time market data (hypertable)
- Historical OHLCV data (hypertable)
- Watchlists and alerts

### ClickHouse (Port 8123/9000)
- Historical market data for analytics
- Trading performance metrics
- User behavior analytics
- Market sentiment data

### Redis (Port 6379)
- User sessions
- Real-time market data cache
- Pub/sub for live updates
- Rate limiting

### Kafka (Port 9092)
Topics:
- `market-data`: Real-time price feeds
- `order-events`: Trade executions
- `user-events`: User actions
- `alerts`: Price alerts
- `portfolio-updates`: Portfolio changes
- `notifications`: User notifications

## Environment Variables

Create `.env` file:
```env
POSTGRES_DB=stockmarket
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
REDIS_PASSWORD=aimstocks2024
CLICKHOUSE_DB=analytics
```

## Data Retention

- Market data: 6 months (TimescaleDB)
- Historical data: 5 years (TimescaleDB)
- Analytics data: Unlimited (ClickHouse)
- Redis cache: 24 hours TTL