-- Yahoo Finance Data Schema for TimescaleDB
-- This file contains detailed tables for Yahoo Finance data ingestion

-- Enable TimescaleDB extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ===========================================
-- YAHOO HISTORICAL DATA TABLES
-- ===========================================

-- Main historical price data table (OHLCV)
CREATE TABLE IF NOT EXISTS yahoo_historical_data (
    timestamp TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(10) DEFAULT 'NSE',
    interval VARCHAR(5) NOT NULL, -- '1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo'
    open DECIMAL(12,4),
    high DECIMAL(12,4),
    low DECIMAL(12,4),
    close DECIMAL(12,4),
    adj_close DECIMAL(12,4), -- Adjusted close price
    volume BIGINT,
    dividends DECIMAL(10,4) DEFAULT 0, -- Dividend amount on this date
    stock_splits DECIMAL(10,4) DEFAULT 1, -- Stock split ratio
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timestamp, interval)
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('yahoo_historical_data', 'timestamp', if_not_exists => TRUE);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_yahoo_historical_symbol_timestamp ON yahoo_historical_data (symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_yahoo_historical_interval ON yahoo_historical_data (interval);
CREATE INDEX IF NOT EXISTS idx_yahoo_historical_symbol_interval ON yahoo_historical_data (symbol, interval);

-- ===========================================
-- YAHOO DIVIDENDS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_dividends (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    ex_dividend_date DATE NOT NULL,
    dividend_amount DECIMAL(10,4) NOT NULL,
    record_date DATE,
    payment_date DATE,
    dividend_type VARCHAR(20) DEFAULT 'regular', -- 'regular', 'special', 'interim'
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, ex_dividend_date)
);

-- ===========================================
-- YAHOO STOCK SPLITS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_stock_splits (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    split_date DATE NOT NULL,
    split_ratio VARCHAR(10) NOT NULL, -- e.g., '2:1', '1:10'
    numerator INTEGER NOT NULL,
    denominator INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, split_date)
);

-- ===========================================
-- YAHOO COMPANY INFO TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_company_info (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    company_name VARCHAR(200),
    sector VARCHAR(100),
    industry VARCHAR(100),
    country VARCHAR(50),
    website VARCHAR(200),
    business_summary TEXT,
    market_cap BIGINT,
    enterprise_value BIGINT,
    trailing_pe DECIMAL(10,2),
    forward_pe DECIMAL(10,2),
    peg_ratio DECIMAL(10,2),
    price_to_sales DECIMAL(10,2),
    price_to_book DECIMAL(10,2),
    enterprise_to_revenue DECIMAL(10,2),
    enterprise_to_ebitda DECIMAL(10,2),
    beta DECIMAL(8,4),
    fifty_two_week_high DECIMAL(12,4),
    fifty_two_week_low DECIMAL(12,4),
    fifty_day_moving_average DECIMAL(12,4),
    two_hundred_day_moving_average DECIMAL(12,4),
    shares_outstanding BIGINT,
    shares_float BIGINT,
    percent_held_by_insiders DECIMAL(5,2),
    percent_held_by_institutions DECIMAL(5,2),
    short_ratio DECIMAL(8,4),
    short_percent_of_float DECIMAL(5,2),
    shares_short BIGINT,
    book_value DECIMAL(12,4),
    price_to_book DECIMAL(10,2),
    trailing_eps DECIMAL(10,2),
    forward_eps DECIMAL(10,2),
    peg_ratio_five_year_expected DECIMAL(10,2),
    last_dividend_value DECIMAL(10,4),
    last_dividend_date DATE,
    dividend_yield DECIMAL(7,4),
    five_year_avg_dividend_yield DECIMAL(7,4),
    payout_ratio DECIMAL(7,4),
    currency VARCHAR(3) DEFAULT 'INR',
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- YAHOO FINANCIAL STATEMENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_income_statement (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    period_type VARCHAR(10) NOT NULL, -- 'annual', 'quarterly'
    total_revenue BIGINT,
    cost_of_revenue BIGINT,
    gross_profit BIGINT,
    operating_expense BIGINT,
    operating_income BIGINT,
    net_income BIGINT,
    ebit BIGINT,
    ebitda BIGINT,
    interest_expense BIGINT,
    income_before_tax BIGINT,
    income_tax_expense BIGINT,
    research_development BIGINT,
    selling_general_admin BIGINT,
    non_recurring BIGINT,
    other_operating_expenses BIGINT,
    total_operating_expenses BIGINT,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, fiscal_year, period_type)
);

CREATE TABLE IF NOT EXISTS yahoo_balance_sheet (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    period_type VARCHAR(10) NOT NULL, -- 'annual', 'quarterly'
    total_assets BIGINT,
    current_assets BIGINT,
    cash BIGINT,
    cash_and_equivalents BIGINT,
    total_liabilities BIGINT,
    current_liabilities BIGINT,
    total_stockholder_equity BIGINT,
    retained_earnings BIGINT,
    common_stock BIGINT,
    capital_surplus BIGINT,
    treasury_stock BIGINT,
    other_stockholder_equity BIGINT,
    property_plant_equipment BIGINT,
    total_current_assets BIGINT,
    net_tangible_assets BIGINT,
    net_receivables BIGINT,
    inventory BIGINT,
    accounts_payable BIGINT,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, fiscal_year, period_type)
);

CREATE TABLE IF NOT EXISTS yahoo_cash_flow (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    period_type VARCHAR(10) NOT NULL, -- 'annual', 'quarterly'
    operating_cash_flow BIGINT,
    investing_cash_flow BIGINT,
    financing_cash_flow BIGINT,
    net_income BIGINT,
    depreciation BIGINT,
    change_in_receivables BIGINT,
    change_in_liabilities BIGINT,
    change_in_inventory BIGINT,
    change_in_accounts_payable BIGINT,
    capital_expenditures BIGINT,
    investments BIGINT,
    dividends_paid BIGINT,
    net_borrowings BIGINT,
    other_cash_flows_from_investing BIGINT,
    other_cash_flows_from_financing BIGINT,
    effect_of_exchange_rate BIGINT,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, fiscal_year, period_type)
);

-- ===========================================
-- YAHOO OPTIONS DATA
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_options_data (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    option_symbol VARCHAR(50) NOT NULL,
    contract_symbol VARCHAR(50),
    strike DECIMAL(12,2) NOT NULL,
    last_price DECIMAL(12,4),
    bid DECIMAL(12,4),
    ask DECIMAL(12,4),
    change DECIMAL(12,4),
    change_percent DECIMAL(7,4),
    volume BIGINT,
    open_interest BIGINT,
    implied_volatility DECIMAL(7,4),
    in_the_money BOOLEAN,
    contract_size INTEGER DEFAULT 100,
    currency VARCHAR(3) DEFAULT 'INR',
    option_type VARCHAR(4) NOT NULL, -- 'CALL', 'PUT'
    expiration_date DATE NOT NULL,
    last_trade_date TIMESTAMPTZ,
    data_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(option_symbol, data_date)
);

-- ===========================================
-- YAHOO ANALYST RECOMMENDATIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_analyst_recommendations (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    period VARCHAR(10) NOT NULL, -- '0m', '1m', '3m', etc.
    strong_buy INTEGER DEFAULT 0,
    buy INTEGER DEFAULT 0,
    hold INTEGER DEFAULT 0,
    sell INTEGER DEFAULT 0,
    strong_sell INTEGER DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(4,2),
    data_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, period, data_date)
);

-- ===========================================
-- YAHOO NEWS ARTICLES
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_news (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    publisher VARCHAR(100),
    link VARCHAR(1000),
    provider_publish_time TIMESTAMPTZ,
    type VARCHAR(20), -- 'STORY'
    related_tickers TEXT[], -- Array of related symbols
    summary TEXT,
    thumbnail_url VARCHAR(1000),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(link)
);

-- ===========================================
-- YAHOO INSTITUTIONAL HOLDINGS
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_institutional_holders (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    holder_name VARCHAR(200) NOT NULL,
    shares_held BIGINT,
    shares_change BIGINT,
    percent_held DECIMAL(7,4),
    value_held BIGINT,
    date_reported DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, holder_name, date_reported)
);

-- ===========================================
-- YAHOO INSIDER TRANSACTIONS
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_insider_transactions (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    insider_name VARCHAR(200) NOT NULL,
    relation VARCHAR(100),
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50), -- 'Buy', 'Sell', 'Option Exercise', etc.
    owner_type VARCHAR(20), -- 'D' for direct, 'I' for indirect
    shares_traded BIGINT,
    last_price DECIMAL(12,4),
    shares_held BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, insider_name, transaction_date, transaction_type)
);

-- ===========================================
-- YAHOO EARNINGS DATA
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_earnings (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    quarter VARCHAR(10) NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4'
    year INTEGER NOT NULL,
    eps_estimate DECIMAL(10,4),
    eps_actual DECIMAL(10,4),
    eps_difference DECIMAL(10,4),
    surprise_percent DECIMAL(7,4),
    revenue_estimate BIGINT,
    revenue_actual BIGINT,
    revenue_difference BIGINT,
    earnings_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, quarter, year)
);

-- ===========================================
-- YAHOO CALENDAR EVENTS
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_calendar_events (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'Dividend', 'Earnings', 'Split'
    event_date DATE NOT NULL,
    event_title VARCHAR(200),
    event_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, event_type, event_date)
);

-- ===========================================
-- YAHOO DATA INGESTION LOGS
-- ===========================================

CREATE TABLE IF NOT EXISTS yahoo_ingestion_logs (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- 'historical', 'dividends', 'splits', 'info', 'financials', etc.
    interval VARCHAR(5), -- For historical data
    start_date DATE,
    end_date DATE,
    records_processed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'success', -- 'success', 'partial', 'failed'
    error_message TEXT,
    execution_time_seconds DECIMAL(8,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_yahoo_dividends_symbol_date ON yahoo_dividends (symbol, ex_dividend_date DESC);
CREATE INDEX IF NOT EXISTS idx_yahoo_splits_symbol_date ON yahoo_stock_splits (symbol, split_date DESC);
CREATE INDEX IF NOT EXISTS idx_yahoo_company_info_symbol ON yahoo_company_info (symbol);
CREATE INDEX IF NOT EXISTS idx_yahoo_options_symbol_expiration ON yahoo_options_data (symbol, expiration_date);
CREATE INDEX IF NOT EXISTS idx_yahoo_options_strike ON yahoo_options_data (strike);
CREATE INDEX IF NOT EXISTS idx_yahoo_news_symbol ON yahoo_news (symbol);
CREATE INDEX IF NOT EXISTS idx_yahoo_news_publish_time ON yahoo_news (provider_publish_time DESC);
CREATE INDEX IF NOT EXISTS idx_yahoo_earnings_symbol ON yahoo_earnings (symbol, year DESC, quarter DESC);
CREATE INDEX IF NOT EXISTS idx_yahoo_ingestion_logs_symbol_type ON yahoo_ingestion_logs (symbol, data_type, created_at DESC);

-- ===========================================
-- VIEWS FOR COMMON QUERIES
-- ===========================================

-- View for latest company info
CREATE OR REPLACE VIEW yahoo_latest_company_info AS
SELECT DISTINCT ON (symbol)
    symbol,
    company_name,
    sector,
    industry,
    market_cap,
    trailing_pe,
    dividend_yield,
    fifty_two_week_high,
    fifty_two_week_low,
    last_updated
FROM yahoo_company_info
ORDER BY symbol, last_updated DESC;

-- View for latest stock prices by interval
CREATE OR REPLACE VIEW yahoo_latest_prices AS
SELECT DISTINCT ON (symbol, interval)
    symbol,
    interval,
    timestamp,
    close as last_price,
    volume,
    (close - LAG(close) OVER (PARTITION BY symbol, interval ORDER BY timestamp)) as price_change,
    ((close - LAG(close) OVER (PARTITION BY symbol, interval ORDER BY timestamp)) / LAG(close) OVER (PARTITION BY symbol, interval ORDER BY timestamp) * 100) as change_percent
FROM yahoo_historical_data
ORDER BY symbol, interval, timestamp DESC;

-- View for upcoming dividends
CREATE OR REPLACE VIEW yahoo_upcoming_dividends AS
SELECT
    symbol,
    ex_dividend_date,
    dividend_amount,
    dividend_yield,
    payment_date
FROM yahoo_dividends
WHERE ex_dividend_date >= CURRENT_DATE
ORDER BY ex_dividend_date;

-- View for earnings calendar
CREATE OR REPLACE VIEW yahoo_earnings_calendar AS
SELECT
    symbol,
    earnings_date,
    quarter,
    year,
    eps_estimate,
    eps_actual,
    surprise_percent
FROM yahoo_earnings
WHERE earnings_date >= CURRENT_DATE
ORDER BY earnings_date;

-- ===========================================
-- FUNCTIONS FOR DATA ANALYSIS
-- ===========================================

-- Function to get stock performance over time periods
CREATE OR REPLACE FUNCTION yahoo_get_stock_performance(
    p_symbol VARCHAR(20),
    p_interval VARCHAR(5),
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    symbol VARCHAR(20),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    start_price DECIMAL(12,4),
    end_price DECIMAL(12,4),
    price_change DECIMAL(12,4),
    change_percent DECIMAL(7,4),
    volatility DECIMAL(7,4)
) AS $$
BEGIN
    RETURN QUERY
    WITH price_data AS (
        SELECT
            symbol,
            timestamp,
            close,
            ROW_NUMBER() OVER (ORDER BY timestamp ASC) as rn_asc,
            ROW_NUMBER() OVER (ORDER BY timestamp DESC) as rn_desc,
            COUNT(*) OVER () as total_rows
        FROM yahoo_historical_data
        WHERE symbol = p_symbol
          AND interval = p_interval
          AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days
    ),
    start_price AS (
        SELECT close as price, timestamp as date
        FROM price_data
        WHERE rn_asc = 1
    ),
    end_price AS (
        SELECT close as price, timestamp as date
        FROM price_data
        WHERE rn_desc = 1
    ),
    volatility_calc AS (
        SELECT
            STDDEV(close) / AVG(close) * 100 as volatility_pct
        FROM yahoo_historical_data
        WHERE symbol = p_symbol
          AND interval = p_interval
          AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days
    )
    SELECT
        p_symbol,
        sp.date,
        ep.date,
        sp.price,
        ep.price,
        (ep.price - sp.price),
        ((ep.price - sp.price) / sp.price * 100),
        v.volatility_pct
    FROM start_price sp
    CROSS JOIN end_price ep
    CROSS JOIN volatility_calc v;
END;
$$ LANGUAGE plpgsql;

-- Function to get dividend history and yield
CREATE OR REPLACE FUNCTION yahoo_get_dividend_info(p_symbol VARCHAR(20))
RETURNS TABLE (
    symbol VARCHAR(20),
    total_dividends_last_year DECIMAL(10,4),
    dividend_yield DECIMAL(7,4),
    payout_frequency INTEGER,
    last_dividend_date DATE,
    last_dividend_amount DECIMAL(10,4)
) AS $$
BEGIN
    RETURN QUERY
    WITH dividend_summary AS (
        SELECT
            symbol,
            SUM(dividend_amount) as yearly_dividends,
            COUNT(*) as payout_count,
            MAX(ex_dividend_date) as last_date,
            MAX(dividend_amount) as last_amount
        FROM yahoo_dividends
        WHERE symbol = p_symbol
          AND ex_dividend_date >= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY symbol
    ),
    current_yield AS (
        SELECT
            ci.dividend_yield
        FROM yahoo_company_info ci
        WHERE ci.symbol = p_symbol
        ORDER BY ci.last_updated DESC
        LIMIT 1
    )
    SELECT
        ds.symbol,
        ds.yearly_dividends,
        cy.dividend_yield,
        ds.payout_count,
        ds.last_date,
        ds.last_amount
    FROM dividend_summary ds
    CROSS JOIN current_yield cy;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- SAMPLE DATA INSERTION
-- ===========================================

-- Insert sample company info for major Indian stocks
INSERT INTO yahoo_company_info (
    symbol, company_name, sector, industry, country, market_cap,
    trailing_pe, dividend_yield, fifty_two_week_high, fifty_two_week_low
) VALUES
('RELIANCE.NS', 'Reliance Industries Limited', 'Energy', 'Oil & Gas Refining & Marketing', 'India', 1800000000000, 25.5, 0.35, 3100.00, 2200.00),
('TCS.NS', 'Tata Consultancy Services Limited', 'Technology', 'Information Technology Services', 'India', 1200000000000, 28.2, 1.85, 4200.00, 3100.00),
('INFY.NS', 'Infosys Limited', 'Technology', 'Information Technology Services', 'India', 650000000000, 24.8, 2.15, 1950.00, 1350.00),
('HDFCBANK.NS', 'HDFC Bank Limited', 'Financial Services', 'Banks - Regional', 'India', 850000000000, 18.5, 1.25, 1850.00, 1400.00),
('ICICIBANK.NS', 'ICICI Bank Limited', 'Financial Services', 'Banks - Regional', 'India', 750000000000, 17.2, 0.85, 1350.00, 950.00)
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample historical data
INSERT INTO yahoo_historical_data (
    timestamp, symbol, interval, open, high, low, close, volume
) VALUES
(CURRENT_TIMESTAMP - INTERVAL '1 day', 'RELIANCE.NS', '1d', 2850.00, 2900.00, 2820.00, 2885.50, 2500000),
(CURRENT_TIMESTAMP - INTERVAL '2 days', 'RELIANCE.NS', '1d', 2800.00, 2870.00, 2780.00, 2850.00, 2800000),
(CURRENT_TIMESTAMP - INTERVAL '1 day', 'TCS.NS', '1d', 3850.00, 3920.00, 3820.00, 3904.87, 1800000),
(CURRENT_TIMESTAMP - INTERVAL '2 days', 'TCS.NS', '1d', 3800.00, 3870.00, 3780.00, 3850.00, 2000000)
ON CONFLICT (symbol, timestamp, interval) DO NOTHING;

-- Insert sample dividend data
INSERT INTO yahoo_dividends (
    symbol, ex_dividend_date, dividend_amount, record_date, payment_date, dividend_type
) VALUES
('RELIANCE.NS', '2024-08-15', 8.00, '2024-08-16', '2024-08-30', 'interim'),
('TCS.NS', '2024-10-18', 12.00, '2024-10-19', '2024-11-05', 'interim'),
('INFY.NS', '2024-06-21', 18.00, '2024-06-22', '2024-07-10', 'final')
ON CONFLICT (symbol, ex_dividend_date) DO NOTHING;

-- Insert sample earnings data
INSERT INTO yahoo_earnings (
    symbol, quarter, year, eps_estimate, eps_actual, surprise_percent, earnings_date
) VALUES
('RELIANCE.NS', 'Q2', 2024, 45.50, 48.20, 5.93, '2024-11-08'),
('TCS.NS', 'Q2', 2024, 28.75, 30.15, 4.87, '2024-10-12'),
('INFY.NS', 'Q2', 2024, 22.80, 24.10, 5.70, '2024-10-13')
ON CONFLICT (symbol, quarter, year) DO NOTHING;
