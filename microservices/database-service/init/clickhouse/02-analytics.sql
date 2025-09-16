-- User analytics and behavior tracking
CREATE TABLE user_sessions (
    session_id String,
    user_id UInt32,
    start_time DateTime64(3),
    end_time DateTime64(3),
    ip_address String,
    user_agent String,
    device_type LowCardinality(String),
    actions_count UInt32
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(start_time)
ORDER BY (user_id, start_time);

-- Trading performance analytics
CREATE TABLE trading_performance (
    date Date,
    user_id UInt32,
    portfolio_id UInt32,
    total_trades UInt32,
    winning_trades UInt32,
    losing_trades UInt32,
    total_pnl Decimal64(2),
    win_rate Decimal32(2),
    avg_win Decimal64(2),
    avg_loss Decimal64(2),
    sharpe_ratio Decimal32(4),
    max_drawdown Decimal32(4)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, portfolio_id, date);

-- Market sentiment analysis
CREATE TABLE market_sentiment (
    timestamp DateTime64(3),
    symbol LowCardinality(String),
    sentiment_score Decimal32(4), -- -1 to 1
    news_count UInt32,
    social_mentions UInt32,
    volume_spike_factor Decimal32(2)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (symbol, timestamp);

-- Real-time aggregations for dashboards
CREATE MATERIALIZED VIEW portfolio_performance_daily
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (user_id, portfolio_id, date)
AS SELECT
    toDate(timestamp) as date,
    user_id,
    portfolio_id,
    sum(total_value) as daily_value,
    count() as snapshots_count
FROM portfolio_snapshots
GROUP BY date, user_id, portfolio_id;