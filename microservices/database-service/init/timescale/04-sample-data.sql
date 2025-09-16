-- Sample data for development
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES
('demo_user', 'demo@aimstocks.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMhJ4WJ6e', 'Demo', 'User'),
('test_user', 'test@aimstocks.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fMhJ4WJ6e', 'Test', 'User')
ON CONFLICT (username) DO NOTHING;

INSERT INTO portfolios (user_id, name, is_default, cash_balance) VALUES
(1, 'Default Portfolio', true, 100000.00),
(2, 'Growth Portfolio', true, 50000.00)
ON CONFLICT DO NOTHING;

INSERT INTO symbol_master (ex_symbol, symbol_ticker, exchange_name, ex_series, company_name, upper_price, lower_price) VALUES
('NSE:RELIANCE-EQ', 'RELIANCE', 'NSE', 'EQ', 'Reliance Industries Limited', 3000.00, 2000.00),
('NSE:TCS-EQ', 'TCS', 'NSE', 'EQ', 'Tata Consultancy Services Limited', 4000.00, 2500.00),
('NSE:INFY-EQ', 'INFY', 'NSE', 'EQ', 'Infosys Limited', 2000.00, 1200.00),
('NSE:HDFCBANK-EQ', 'HDFCBANK', 'NSE', 'EQ', 'HDFC Bank Limited', 1800.00, 1400.00),
('NSE:ICICIBANK-EQ', 'ICICIBANK', 'NSE', 'EQ', 'ICICI Bank Limited', 1300.00, 900.00),
('NSE:WIPRO-EQ', 'WIPRO', 'NSE', 'EQ', 'Wipro Limited', 600.00, 400.00),
('NSE:LT-EQ', 'LT', 'NSE', 'EQ', 'Larsen & Toubro Limited', 3500.00, 2000.00),
('NSE:BHARTIARTL-EQ', 'BHARTIARTL', 'NSE', 'EQ', 'Bharti Airtel Limited', 1200.00, 600.00),
('NSE:MARUTI-EQ', 'MARUTI', 'NSE', 'EQ', 'Maruti Suzuki India Limited', 12000.00, 8000.00),
('NSE:ASIANPAINT-EQ', 'ASIANPAINT', 'NSE', 'EQ', 'Asian Paints Limited', 3500.00, 2500.00)
ON CONFLICT (ex_symbol, exchange_name) DO NOTHING;

-- Sample watchlist
INSERT INTO watchlists (user_id, name, is_default) VALUES
(1, 'My Watchlist', true),
(2, 'Tech Stocks', true)
ON CONFLICT DO NOTHING;

INSERT INTO watchlist_symbols (watchlist_id, symbol, exchange) VALUES
(1, 'NSE:RELIANCE-EQ', 'NSE'),
(1, 'NSE:TCS-EQ', 'NSE'),
(1, 'NSE:INFY-EQ', 'NSE'),
(2, 'NSE:TCS-EQ', 'NSE'),
(2, 'NSE:INFY-EQ', 'NSE'),
(2, 'NSE:WIPRO-EQ', 'NSE')
ON CONFLICT DO NOTHING;