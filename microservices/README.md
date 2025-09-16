# Microservices Database Integration

## Service Architecture

### 1. User Service
- **Database**: TimescaleDB (users, user_tokens, user_profiles)
- **Cache**: Redis (sessions, user data)
- **Events**: Publishes to `user-events`

### 2. Portfolio Service  
- **Database**: TimescaleDB (portfolios, holdings, funds)
- **Cache**: Redis (portfolio snapshots)
- **Events**: Publishes to `portfolio-updates`
- **Analytics**: Sends data to ClickHouse

### 3. Trading Service
- **Database**: TimescaleDB (orders, executions)
- **Cache**: Redis (order book, pending orders)
- **Events**: Publishes to `order-events`

### 4. Market Data Service
- **Database**: TimescaleDB (market_data, historical_data)
- **Cache**: Redis (live prices, quotes)
- **Events**: Publishes to `market-data`
- **Analytics**: Streams to ClickHouse

### 5. Analytics Service
- **Database**: ClickHouse (all analytics tables)
- **Cache**: Redis (dashboard data)
- **Events**: Consumes all Kafka topics

## Data Flow

```
Frontend → API Gateway → Microservice → TimescaleDB
                                    ↓
                                  Kafka → ClickHouse
                                    ↓
                                  Redis Cache
```

## Event Patterns

- **User Events**: Registration, login, profile updates
- **Portfolio Events**: Holdings changes, value updates
- **Order Events**: Order placement, execution, cancellation
- **Market Events**: Price updates, volume changes
- **Alert Events**: Price alerts, notifications