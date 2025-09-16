-- Historical market data for analytics
CREATE TABLE market_history (
    timestamp DateTime64(3),
    symbol LowCardinality(String),
    price Decimal64(4),
    volume UInt64,
    bid Decimal64(4),
    ask Decimal64(4),
    bid_size UInt32,
    ask_size UInt32
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (symbol, timestamp);

-- OHLCV historical data
CREATE TABLE ohlcv_history (
    timestamp DateTime64(3),
    symbol LowCardinality(String),
    timeframe LowCardinality(String),
    open Decimal64(4),
    high Decimal64(4),
    low Decimal64(4),
    close Decimal64(4),
    volume UInt64
) ENGINE = MergeTree()
PARTITION BY (toYYYYMM(timestamp), timeframe)
ORDER BY (symbol, timeframe, timestamp);

-- Trade executions for backtesting
CREATE TABLE trade_executions (
    timestamp DateTime64(3),
    user_id UInt32,
    symbol LowCardinality(String),
    side Enum8('BUY' = 1, 'SELL' = 2),
    quantity Decimal64(4),
    price Decimal64(4),
    commission Decimal64(4)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, timestamp);

-- Portfolio snapshots for performance tracking
CREATE TABLE portfolio_snapshots (
    timestamp DateTime64(3),
    user_id UInt32,
    portfolio_id UInt32,
    total_value Decimal64(2),
    cash_balance Decimal64(2),
    positions_value Decimal64(2)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (user_id, portfolio_id, timestamp);

-- Materialized view for real-time aggregations
CREATE MATERIALIZED VIEW market_data_1m
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (symbol, timestamp)
AS SELECT
    toStartOfMinute(timestamp) as timestamp,
    symbol,
    argMin(price, timestamp) as open,
    max(price) as high,
    min(price) as low,
    argMax(price, timestamp) as close,
    sum(volume) as volume
FROM market_history
WHERE timestamp >= now() - INTERVAL 1 DAY
GROUP BY symbol, toStartOfMinute(timestamp);