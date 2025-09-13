#!/bin/bash

# Setup complete AimStocks database with all tables and data

echo "🚀 Setting up AimStocks database..."

# Start MySQL container
echo "📦 Starting MySQL container..."
docker-compose up -d mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 15

# Create missing tables
echo "📋 Creating additional tables..."
docker exec aimstocks_mysql mysql -u aimstocks_user -paimstocks_password aimstocks << 'EOF'
-- Create broker connections table
CREATE TABLE IF NOT EXISTS broker_connections (
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

-- Create algorithms table
CREATE TABLE IF NOT EXISTS algorithms (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
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

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create options data table
CREATE TABLE IF NOT EXISTS options_data (
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

-- Create news table
CREATE TABLE IF NOT EXISTS news (
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
EOF

echo "✅ Tables created successfully!"

# Insert sample data
echo "📊 Inserting sample data..."
docker exec aimstocks_mysql mysql -u aimstocks_user -paimstocks_password aimstocks << 'EOF'
-- Add broker connections
INSERT IGNORE INTO broker_connections (user_id, broker_name, client_id, access_token, is_active) VALUES 
(1, 'FYERS', 'XA12345-100', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.example_fyers_token', TRUE);

-- Update existing market data and add new entries
INSERT INTO market_data (symbol, exchange, ltp, open_price, high_price, low_price, volume, change_value, change_percent) VALUES 
('BANKNIFTY', 'NSE', 52645.18, 52500.00, 52700.75, 52400.25, 0, 145.18, 0.28),
('RELIANCE', 'NSE', 2875.50, 2860.00, 2890.75, 2850.25, 1250000, 15.50, 0.54),
('TCS', 'NSE', 3880.25, 3900.00, 3920.50, 3870.75, 890000, -19.75, -0.51),
('INFY', 'NSE', 1675.80, 1670.00, 1685.25, 1665.50, 1100000, 5.80, 0.35),
('HDFCBANK', 'NSE', 1595.30, 1580.00, 1600.75, 1575.25, 980000, 15.30, 0.97),
('ICICIBANK', 'NSE', 1245.60, 1240.00, 1250.25, 1235.75, 1350000, 5.60, 0.45)
ON DUPLICATE KEY UPDATE 
ltp = VALUES(ltp), 
open_price = VALUES(open_price), 
high_price = VALUES(high_price), 
low_price = VALUES(low_price),
volume = VALUES(volume),
change_value = VALUES(change_value),
change_percent = VALUES(change_percent);

-- Add algorithms
INSERT IGNORE INTO algorithms (user_id, name, description, type, category, status) VALUES 
(1, 'Moving Average Crossover', 'Simple MA crossover strategy', 'PREDEFINED', 'TREND_FOLLOWING', 'STOPPED'),
(1, 'RSI Oversold', 'Buy when RSI < 30', 'PREDEFINED', 'MEAN_REVERSION', 'STOPPED'),
(1, 'Momentum Strategy', 'Custom momentum based strategy', 'CUSTOM', 'MOMENTUM', 'STOPPED');

-- Add alerts
INSERT IGNORE INTO alerts (user_id, symbol, alert_type, condition_value, message) VALUES 
(1, 'RELIANCE', 'PRICE_ABOVE', 2900.00, 'RELIANCE crossed 2900'),
(1, 'NIFTY50', 'PRICE_BELOW', 24800.00, 'NIFTY below 24800'),
(1, 'TCS', 'PRICE_ABOVE', 4000.00, 'TCS reached 4000');

-- Add system settings
INSERT IGNORE INTO system_settings (setting_key, setting_value, description) VALUES 
('market_open_time', '09:15', 'Market opening time'),
('market_close_time', '15:30', 'Market closing time'),
('data_refresh_interval', '5', 'Data refresh interval in seconds'),
('max_watchlist_symbols', '50', 'Maximum symbols in watchlist'),
('default_broker', 'FYERS', 'Default broker for new users'),
('enable_options_trading', 'true', 'Enable options trading features');

-- Add sample options data
INSERT IGNORE INTO options_data (underlying_symbol, strike_price, expiry_date, option_type, symbol, ltp, open_interest) VALUES 
('NIFTY', 24800, '2025-01-30', 'CE', 'NIFTY25JAN24800CE', 105.50, 2340000),
('NIFTY', 24800, '2025-01-30', 'PE', 'NIFTY25JAN24800PE', 54.20, 1450000),
('NIFTY', 24850, '2025-01-30', 'CE', 'NIFTY25JAN24850CE', 75.30, 3120000),
('NIFTY', 24850, '2025-01-30', 'PE', 'NIFTY25JAN24850PE', 73.90, 1780000),
('NIFTY', 24900, '2025-01-30', 'CE', 'NIFTY25JAN24900CE', 52.15, 2890000),
('NIFTY', 24900, '2025-01-30', 'PE', 'NIFTY25JAN24900PE', 98.45, 2100000);

-- Add sample news
INSERT IGNORE INTO news (title, content, source, category, sentiment, published_at) VALUES 
('Market Opens Higher on Positive Global Cues', 'Indian markets opened higher today following positive overnight cues from global markets...', 'Market News', 'MARKET', 'POSITIVE', NOW()),
('RBI Monetary Policy Decision Expected', 'Reserve Bank of India is expected to announce its monetary policy decision...', 'Economic Times', 'POLICY', 'NEUTRAL', NOW()),
('Tech Stocks Rally on Strong Earnings', 'Technology stocks rallied after strong quarterly earnings from major IT companies...', 'Business Standard', 'SECTOR', 'POSITIVE', NOW());
EOF

echo "✅ Sample data inserted successfully!"

# Verify setup
echo "🔍 Verifying database setup..."
docker exec aimstocks_mysql mysql -u aimstocks_user -paimstocks_password aimstocks -e "
SELECT 'Tables' as Info, COUNT(*) as Count FROM information_schema.tables WHERE table_schema = 'aimstocks'
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Portfolios', COUNT(*) FROM portfolios
UNION ALL
SELECT 'Holdings', COUNT(*) FROM holdings
UNION ALL
SELECT 'Broker Connections', COUNT(*) FROM broker_connections
UNION ALL
SELECT 'Market Data', COUNT(*) FROM market_data
UNION ALL
SELECT 'Algorithms', COUNT(*) FROM algorithms
UNION ALL
SELECT 'Alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'Options Data', COUNT(*) FROM options_data
UNION ALL
SELECT 'News', COUNT(*) FROM news;
"

echo ""
echo "🎉 AimStocks database setup completed successfully!"
echo "📊 Database: aimstocks"
echo "🔗 Connection: localhost:3306"
echo "👤 User: aimstocks_user"
echo "🔑 Password: aimstocks_password"
echo ""
echo "📋 Available tables:"
docker exec aimstocks_mysql mysql -u aimstocks_user -paimstocks_password aimstocks -e "SHOW TABLES;"