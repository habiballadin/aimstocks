# Python Microservices Database Alignment

## Architecture Overview

### Database Connections
- **TimescaleDB**: Primary transactional database (asyncpg)
- **Redis**: Caching and sessions (redis.asyncio)
- **ClickHouse**: Analytics warehouse (clickhouse-driver)
- **Kafka**: Event streaming (aiokafka)

### Service Structure

#### User Service
```python
# Database: TimescaleDB (users, user_tokens, user_profiles)
# Cache: Redis (user sessions, profile data)
# Events: Publishes user_created, user_updated to 'user-events'
```

#### Portfolio Service
```python
# Database: TimescaleDB (portfolios, holdings, funds)
# Cache: Redis (portfolio snapshots, holdings cache)
# Events: Publishes portfolio_updated to 'portfolio-updates'
# Analytics: Sends portfolio snapshots to ClickHouse
```

#### Market Data Service
```python
# Database: TimescaleDB (market_data, historical_data)
# Cache: Redis (live prices, quotes, 60s TTL)
# Events: Publishes price_update to 'market-data'
# Analytics: Streams market history to ClickHouse
```

#### Analytics Service
```python
# Database: ClickHouse (all analytics tables)
# Cache: Redis (dashboard data, performance metrics)
# Events: Consumes all Kafka topics for analytics
```

## Data Flow Patterns

### Write Pattern
```
Service → TimescaleDB → Kafka Event → ClickHouse Analytics
                    ↓
                Redis Cache (TTL-based)
```

### Read Pattern
```
Service → Redis Cache → TimescaleDB (fallback) → Response
```

### Event Streaming
```
Market Data → Kafka → Multiple Consumers → Analytics/Alerts
```

## Installation

```bash
pip install -r requirements.txt
```

## Environment Variables

```env
TIMESCALE_HOST=localhost
TIMESCALE_PORT=5434
TIMESCALE_DB=stockmarket
TIMESCALE_USER=postgres
TIMESCALE_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=aimstocks2024

CLICKHOUSE_HOST=localhost
CLICKHOUSE_PORT=9000
CLICKHOUSE_DB=analytics

KAFKA_BROKER=localhost:9092
```