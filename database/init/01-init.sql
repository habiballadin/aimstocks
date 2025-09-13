-- AimStocks Complete Database Schema

USE aimstocks;

-- Users and Authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    pan VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Broker Connections
CREATE TABLE broker_connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    broker_name ENUM('FYERS', 'ZERODHA', 'UPSTOX', 'ANGEL') NOT NULL,
    client_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Portfolios
CREATE TABLE portfolios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 0,
    day_change DECIMAL(15,2) DEFAULT 0,
    day_change_percent DECIMAL(5,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Holdings
CREATE TABLE holdings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    portfolio_id INT NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    avg_price DECIMAL(10,2) NOT NULL,
    current_price DECIMAL(10,2),
    market_value DECIMAL(15,2),
    pnl DECIMAL(15,2),
    pnl_percent DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    broker_order_id VARCHAR(255),
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    order_type ENUM('BUY', 'SELL') NOT NULL,
    product_type ENUM('CNC', 'MIS', 'NRML') DEFAULT 'CNC',
    price_type ENUM('MARKET', 'LIMIT', 'SL', 'SL-M') DEFAULT 'MARKET',
    quantity INT NOT NULL,
    price DECIMAL(10,2),
    trigger_price DECIMAL(10,2),
    filled_quantity INT DEFAULT 0,
    avg_fill_price DECIMAL(10,2),
    status ENUM('PENDING', 'OPEN', 'COMPLETE', 'CANCELLED', 'REJECTED') DEFAULT 'PENDING',
    validity ENUM('DAY', 'IOC', 'GTD') DEFAULT 'DAY',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Watchlist
CREATE TABLE watchlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) DEFAULT 'Default',
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Market Data Cache
CREATE TABLE market_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    ltp DECIMAL(10,2),
    open_price DECIMAL(10,2),
    high_price DECIMAL(10,2),
    low_price DECIMAL(10,2),
    prev_close DECIMAL(10,2),
    volume BIGINT,
    change_value DECIMAL(10,2),
    change_percent DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_symbol_exchange (symbol, exchange)
);

-- Options Data
CREATE TABLE options_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    underlying_symbol VARCHAR(50) NOT NULL,
    strike_price DECIMAL(10,2) NOT NULL,
    expiry_date DATE NOT NULL,
    option_type ENUM('CE', 'PE') NOT NULL,
    symbol VARCHAR(100) NOT NULL,
    ltp DECIMAL(10,2),
    bid DECIMAL(10,2),
    ask DECIMAL(10,2),
    volume BIGINT,
    open_interest BIGINT,
    change_value DECIMAL(10,2),
    change_percent DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_option (symbol)
);

-- Algorithms
CREATE TABLE algorithms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('PREDEFINED', 'CUSTOM') NOT NULL,
    category VARCHAR(100),
    python_code TEXT,
    parameters JSON,
    status ENUM('STOPPED', 'RUNNING', 'PAUSED') DEFAULT 'STOPPED',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Algorithm Executions
CREATE TABLE algorithm_executions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    algorithm_id INT NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    action ENUM('BUY', 'SELL', 'HOLD') NOT NULL,
    quantity INT,
    price DECIMAL(10,2),
    confidence DECIMAL(3,2),
    reason TEXT,
    status ENUM('PENDING', 'EXECUTED', 'FAILED') DEFAULT 'PENDING',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (algorithm_id) REFERENCES algorithms(id) ON DELETE CASCADE
);

-- Backtests
CREATE TABLE backtests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    algorithm_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(15,2) NOT NULL,
    final_value DECIMAL(15,2),
    total_return DECIMAL(5,2),
    sharpe_ratio DECIMAL(5,2),
    max_drawdown DECIMAL(5,2),
    total_trades INT,
    win_rate DECIMAL(5,2),
    status ENUM('RUNNING', 'COMPLETED', 'FAILED') DEFAULT 'RUNNING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (algorithm_id) REFERENCES algorithms(id) ON DELETE CASCADE
);

-- Alerts
CREATE TABLE alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    alert_type ENUM('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_SPIKE', 'CUSTOM') NOT NULL,
    condition_value DECIMAL(10,2),
    message TEXT,
    is_triggered BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- News and Events
CREATE TABLE news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    source VARCHAR(255),
    category VARCHAR(100),
    symbols JSON,
    sentiment ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL'),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System Settings
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_market_data_symbol ON market_data(symbol);
CREATE INDEX idx_options_underlying ON options_data(underlying_symbol);
CREATE INDEX idx_algorithms_user ON algorithms(user_id);
CREATE INDEX idx_executions_algorithm ON algorithm_executions(algorithm_id);
CREATE INDEX idx_alerts_user ON alerts(user_id);
CREATE INDEX idx_news_published ON news(published_at);

-- Insert Sample Data
INSERT INTO users (email, password_hash, name, phone, pan) VALUES 
('demo@aimstocks.com', '$2b$10$example_hash', 'Demo User', '9876543210', 'ABCDE1234F'),
('trader@aimstocks.com', '$2b$10$example_hash2', 'Pro Trader', '9876543211', 'FGHIJ5678K');

INSERT INTO portfolios (user_id, name, total_value, is_default) VALUES 
(1, 'Main Portfolio', 500000.00, TRUE),
(1, 'Options Portfolio', 100000.00, FALSE),
(2, 'Trading Portfolio', 1000000.00, TRUE);

INSERT INTO holdings (portfolio_id, symbol, exchange, quantity, avg_price, current_price) VALUES 
(1, 'RELIANCE', 'NSE', 100, 2850.00, 2875.50),
(1, 'TCS', 'NSE', 50, 3900.00, 3880.25),
(1, 'INFY', 'NSE', 75, 1650.00, 1675.80),
(1, 'HDFCBANK', 'NSE', 60, 1580.00, 1595.30);

INSERT INTO watchlist (user_id, symbol, exchange) VALUES 
(1, 'NIFTY50', 'NSE'),
(1, 'BANKNIFTY', 'NSE'),
(1, 'RELIANCE', 'NSE'),
(1, 'TCS', 'NSE'),
(1, 'INFY', 'NSE'),
(1, 'HDFCBANK', 'NSE'),
(1, 'ICICIBANK', 'NSE');

INSERT INTO market_data (symbol, exchange, ltp, open_price, high_price, low_price, volume) VALUES 
('NIFTY50', 'NSE', 24850.75, 24900.00, 24950.25, 24800.50, 0),
('BANKNIFTY', 'NSE', 52645.18, 52500.00, 52700.75, 52400.25, 0),
('RELIANCE', 'NSE', 2875.50, 2860.00, 2890.75, 2850.25, 1250000),
('TCS', 'NSE', 3880.25, 3900.00, 3920.50, 3870.75, 890000),
('INFY', 'NSE', 1675.80, 1670.00, 1685.25, 1665.50, 1100000);

INSERT INTO algorithms (user_id, name, description, type, category, status) VALUES 
(1, 'Moving Average Crossover', 'Simple MA crossover strategy', 'PREDEFINED', 'TREND_FOLLOWING', 'STOPPED'),
(1, 'RSI Oversold', 'Buy when RSI < 30', 'PREDEFINED', 'MEAN_REVERSION', 'STOPPED');

INSERT INTO alerts (user_id, symbol, alert_type, condition_value, message) VALUES 
(1, 'RELIANCE', 'PRICE_ABOVE', 2900.00, 'RELIANCE crossed 2900'),
(1, 'NIFTY50', 'PRICE_BELOW', 24800.00, 'NIFTY below 24800');

INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('market_open_time', '09:15', 'Market opening time'),
('market_close_time', '15:30', 'Market closing time'),
('data_refresh_interval', '5', 'Data refresh interval in seconds'),
('max_watchlist_symbols', '50', 'Maximum symbols in watchlist');