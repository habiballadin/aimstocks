-- Real-time market data (time-series)
CREATE TABLE market_data (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    ltp DECIMAL(10,4) NOT NULL,
    open_price DECIMAL(10,4),
    high_price DECIMAL(10,4),
    low_price DECIMAL(10,4),
    prev_close DECIMAL(10,4),
    change_value DECIMAL(10,4),
    change_percent DECIMAL(7,2),
    volume BIGINT,
    bid DECIMAL(10,4),
    ask DECIMAL(10,4),
    bid_size INTEGER,
    ask_size INTEGER
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('market_data', 'time', chunk_time_interval => INTERVAL '1 hour');

-- Historical OHLCV data with technical indicators
CREATE TABLE historical_data (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    timeframe VARCHAR(5) NOT NULL, -- 1m, 5m, 15m, 1h, 1d
    open DECIMAL(10,4) NOT NULL,
    high DECIMAL(10,4) NOT NULL,
    low DECIMAL(10,4) NOT NULL,
    close DECIMAL(10,4) NOT NULL,
    volume BIGINT NOT NULL,
    sma_20 DECIMAL(10,4),
    sma_50 DECIMAL(10,4),
    ema_12 DECIMAL(10,4),
    ema_26 DECIMAL(10,4),
    rsi_14 DECIMAL(5,2),
    macd DECIMAL(10,4),
    macd_signal DECIMAL(10,4),
    bollinger_upper DECIMAL(10,4),
    bollinger_lower DECIMAL(10,4)
);

SELECT create_hypertable('historical_data', 'time', chunk_time_interval => INTERVAL '1 day');

-- Performance indexes
CREATE INDEX idx_market_data_symbol_time ON market_data (symbol, exchange, time DESC);
CREATE INDEX idx_historical_data_symbol_time ON historical_data (symbol, exchange, timeframe, time DESC);
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_symbol_status ON orders (symbol, exchange, status);
CREATE INDEX idx_holdings_portfolio ON holdings (portfolio_id);
CREATE INDEX idx_alerts_user_active ON alerts (user_id, is_active);
CREATE INDEX idx_user_tokens_user_type ON user_tokens (user_id, token_type);
CREATE INDEX idx_symbol_master_ticker ON symbol_master (symbol_ticker, exchange_name);

-- Retention policies
SELECT add_retention_policy('market_data', INTERVAL '6 months');
SELECT add_retention_policy('historical_data', INTERVAL '5 years');