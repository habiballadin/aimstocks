-- Symbol Master Table for AimStocks
-- This table stores symbol information for trading

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
    fy_token VARCHAR(20),
    sym_details VARCHAR(200),
    previous_close DECIMAL(15,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ex_symbol, exchange_name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_symbol_master_ex_symbol ON symbol_master (ex_symbol);
CREATE INDEX IF NOT EXISTS idx_symbol_master_exchange ON symbol_master (exchange_name);
CREATE INDEX IF NOT EXISTS idx_symbol_master_ticker ON symbol_master (symbol_ticker);

-- Insert sample symbol data
INSERT INTO symbol_master (ex_symbol, symbol_ticker, exchange_name, ex_series, company_name, upper_price, lower_price) VALUES
('NSE:RELIANCE-EQ', 'RELIANCE', 'NSE_CM', 'EQ', 'Reliance Industries Limited', 3000.00, 2000.00),
('NSE:TCS-EQ', 'TCS', 'NSE_CM', 'EQ', 'Tata Consultancy Services Limited', 4000.00, 2500.00),
('NSE:INFY-EQ', 'INFY', 'NSE_CM', 'EQ', 'Infosys Limited', 2000.00, 1200.00),
('NSE:HDFCBANK-EQ', 'HDFCBANK', 'NSE_CM', 'EQ', 'HDFC Bank Limited', 1800.00, 1400.00),
('NSE:ICICIBANK-EQ', 'ICICIBANK', 'NSE_CM', 'EQ', 'ICICI Bank Limited', 1300.00, 900.00)
ON CONFLICT (ex_symbol, exchange_name) DO NOTHING;
