-- Update funds table to store all fund_limit entries from Fyers API

-- Drop the old funds table if it exists
DROP TABLE IF EXISTS funds;

-- Create new funds table structure
CREATE TABLE funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    fund_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    equity_amount DECIMAL(18, 8) DEFAULT 0,
    commodity_amount DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_fund (user_id, fund_id)
);
