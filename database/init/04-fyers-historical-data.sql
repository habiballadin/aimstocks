-- Fyers Historical Data Table for TimescaleDB
-- This table stores historical price data from Fyers API

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

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('fyers_historical_data', 'timestamp', if_not_exists => TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fyers_historical_symbol_timestamp ON fyers_historical_data (symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fyers_historical_date ON fyers_historical_data (date DESC);
