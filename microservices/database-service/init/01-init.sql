-- PostgreSQL/TimescaleDB Initialization for AimStocks

-- Create database (if not exists)
-- Note: Database creation is handled by docker-compose, this script runs inside the database

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id),
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    avg_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2),
    market_value DECIMAL(15,2),
    pnl DECIMAL(15,2),
    pnl_percent DECIMAL(7,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, symbol, exchange)
);

CREATE TABLE IF NOT EXISTS market_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    ltp DECIMAL(10,2),
    open_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    prev_close DECIMAL(10,2),
    change_value DECIMAL(10,2),
    change_percent DECIMAL(7,2),
    volume BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, exchange, timestamp)
);

-- Convert market_data to hypertable for TimescaleDB
SELECT create_hypertable('market_data', 'timestamp', if_not_exists => TRUE);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(20) NOT NULL, -- PRICE_ABOVE, PRICE_BELOW
    condition_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    order_type VARCHAR(10) NOT NULL, -- BUY, SELL
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2),
    order_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, EXECUTED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50),
    expires_at TIMESTAMP,
    refresh_expires_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token_type)
);

CREATE TABLE IF NOT EXISTS user_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    username VARCHAR(100),
    email VARCHAR(100),
    fy_id VARCHAR(50),
    name VARCHAR(100),
    display_name VARCHAR(100),
    mobile_number VARCHAR(20),
    pan VARCHAR(20),
    pin_change_date DATE,
    pwd_change_date DATE,
    totp BOOLEAN DEFAULT FALSE,
    pwd_to_expire INTEGER,
    ddpi_enabled BOOLEAN DEFAULT FALSE,
    mtf_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS funds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    equity_amount DECIMAL(15,2) DEFAULT 0,
    commodity_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS symbol_master (
    id SERIAL PRIMARY KEY,
    ex_symbol VARCHAR(50) NOT NULL,
    symbol_ticker VARCHAR(50),
    exchange_name VARCHAR(20) NOT NULL,
    ex_series VARCHAR(10) NOT NULL,
    company_name VARCHAR(200),
    trade_status INTEGER DEFAULT 1,
    upper_price DECIMAL(10,2),
    lower_price DECIMAL(10,2),
    min_lot_size INTEGER DEFAULT 1,
    tick_size DECIMAL(5,2) DEFAULT 0.01,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ex_symbol, exchange_name)
);

-- Create TimescaleDB hypertables for time-series data
CREATE TABLE IF NOT EXISTS fyers_historical_data (
    timestamp BIGINT NOT NULL,
    date DATE NOT NULL,
    open DECIMAL(10,2),
    high DECIMAL(10,2),
    low DECIMAL(10,2),
    close DECIMAL(10,2),
    volume BIGINT,
    symbol VARCHAR(50) NOT NULL,
    sma_20 DOUBLE PRECISION,
    sma_50 DOUBLE PRECISION,
    price_change DOUBLE PRECISION,
    price_change_pct DOUBLE PRECISION,
    rsi_14 DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timestamp)
);

-- Convert to hypertable
SELECT create_hypertable('fyers_historical_data', 'timestamp', if_not_exists => TRUE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timestamp ON market_data (symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fyers_historical_symbol_timestamp ON fyers_historical_data (symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_symbol_master_ex_symbol ON symbol_master (ex_symbol);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens (user_id);

-- Insert sample data
INSERT INTO users (username, email, password_hash) VALUES
('demo_user', 'demo@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMhJ4WJ6e')
ON CONFLICT (username) DO NOTHING;

INSERT INTO portfolios (user_id, name) VALUES
(1, 'Demo Portfolio')
ON CONFLICT DO NOTHING;

-- Insert sample symbol data
INSERT INTO symbol_master (ex_symbol, symbol_ticker, exchange_name, ex_series, company_name, upper_price, lower_price) VALUES
('NSE:RELIANCE-EQ', 'RELIANCE', 'NSE', 'EQ', 'Reliance Industries Limited', 3000.00, 2000.00),
('NSE:TCS-EQ', 'TCS', 'NSE', 'EQ', 'Tata Consultancy Services Limited', 4000.00, 2500.00),
('NSE:INFY-EQ', 'INFY', 'NSE', 'EQ', 'Infosys Limited', 2000.00, 1200.00),
('NSE:HDFCBANK-EQ', 'HDFCBANK', 'NSE', 'EQ', 'HDFC Bank Limited', 1800.00, 1400.00),
('NSE:ICICIBANK-EQ', 'ICICIBANK', 'NSE', 'EQ', 'ICICI Bank Limited', 1300.00, 900.00)
ON CONFLICT (ex_symbol, exchange_name) DO NOTHING;
