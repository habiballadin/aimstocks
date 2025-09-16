-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Users and authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolios
CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cash_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holdings
CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    avg_cost DECIMAL(10,4) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) CHECK (side IN ('BUY', 'SELL')),
    quantity DECIMAL(15,4) NOT NULL,
    price DECIMAL(10,4),
    order_type VARCHAR(10) CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP')),
    status VARCHAR(10) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    filled_at TIMESTAMPTZ,
    filled_price DECIMAL(10,4),
    filled_quantity DECIMAL(15,4)
);

-- Market data (time-series)
CREATE TABLE market_data (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(10,4) NOT NULL,
    volume BIGINT,
    bid DECIMAL(10,4),
    ask DECIMAL(10,4),
    bid_size INTEGER,
    ask_size INTEGER
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('market_data', 'time', chunk_time_interval => INTERVAL '1 hour');

-- OHLCV data (aggregated)
CREATE TABLE ohlcv (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(5) NOT NULL, -- 1m, 5m, 1h, 1d
    open DECIMAL(10,4) NOT NULL,
    high DECIMAL(10,4) NOT NULL,
    low DECIMAL(10,4) NOT NULL,
    close DECIMAL(10,4) NOT NULL,
    volume BIGINT NOT NULL
);

SELECT create_hypertable('ohlcv', 'time', chunk_time_interval => INTERVAL '1 day');

-- Watchlists
CREATE TABLE watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watchlist_symbols (
    watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (watchlist_id, symbol)
);

-- Alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    condition_type VARCHAR(20) CHECK (condition_type IN ('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_ABOVE')),
    threshold_value DECIMAL(15,4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    triggered_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_market_data_symbol_time ON market_data (symbol, time DESC);
CREATE INDEX idx_ohlcv_symbol_time ON ohlcv (symbol, timeframe, time DESC);
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX idx_orders_symbol_status ON orders (symbol, status);
CREATE INDEX idx_holdings_portfolio ON holdings (portfolio_id);
CREATE INDEX idx_alerts_user_active ON alerts (user_id, is_active);

-- Retention policy (keep market data for 1 year)
SELECT add_retention_policy('market_data', INTERVAL '1 year');