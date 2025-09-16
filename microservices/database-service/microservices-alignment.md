# Database-Microservices Alignment

## Service-Database Mapping

### 1. User Service
**Primary DB**: TimescaleDB
- Tables: `users`, `user_tokens`, `user_profiles`
- Cache: Redis (sessions, user data)
- Events: Kafka `user-events`

### 2. Portfolio Service  
**Primary DB**: TimescaleDB
- Tables: `portfolios`, `holdings`, `funds`
- Cache: Redis (portfolio snapshots)
- Analytics: ClickHouse `portfolio_snapshots`
- Events: Kafka `portfolio-updates`

### 3. Trading Service
**Primary DB**: TimescaleDB
- Tables: `orders`, `symbol_master`
- Cache: Redis (order book, pending orders)
- Analytics: ClickHouse `trade_executions`
- Events: Kafka `order-events`

### 4. Market Data Service
**Primary DB**: TimescaleDB
- Tables: `market_data`, `historical_data`
- Cache: Redis (live prices, quotes)
- Analytics: ClickHouse `market_history`, `ohlcv_history`
- Events: Kafka `market-data`

### 5. Alert Service
**Primary DB**: TimescaleDB
- Tables: `alerts`, `watchlists`, `watchlist_symbols`
- Cache: Redis (active alerts)
- Events: Kafka `alerts`, `notifications`

### 6. Analytics Service
**Primary DB**: ClickHouse
- All analytics tables
- Cache: Redis (dashboard data)
- Source: All Kafka topics

## Data Flow Patterns

### Write Pattern
Service → TimescaleDB → Kafka Event → ClickHouse Analytics

### Read Pattern
Service → Redis Cache → TimescaleDB (if miss) → Response

### Real-time Pattern
Market Data → Kafka → Redis Cache → WebSocket → Frontend