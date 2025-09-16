-- Core user management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User authentication tokens
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    token_type VARCHAR(50) NOT NULL, -- access, refresh, reset
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token_type)
);

-- User profile details
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    fy_id VARCHAR(50),
    display_name VARCHAR(100),
    mobile_number VARCHAR(20),
    pan VARCHAR(20),
    totp_enabled BOOLEAN DEFAULT false,
    ddpi_enabled BOOLEAN DEFAULT false,
    mtf_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User portfolios
CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    cash_balance DECIMAL(15,2) DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User funds
CREATE TABLE funds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    equity_amount DECIMAL(15,2) DEFAULT 0,
    commodity_amount DECIMAL(15,2) DEFAULT 0,
    available_margin DECIMAL(15,2) DEFAULT 0,
    used_margin DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symbol master data
CREATE TABLE symbol_master (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ex_symbol, exchange_name)
);