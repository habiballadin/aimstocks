-- Portfolio holdings
CREATE TABLE holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    avg_cost DECIMAL(10,4) NOT NULL,
    current_price DECIMAL(10,4),
    market_value DECIMAL(15,2),
    pnl DECIMAL(15,2),
    pnl_percent DECIMAL(7,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(portfolio_id, symbol, exchange)
);

-- Trading orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    side VARCHAR(4) CHECK (side IN ('BUY', 'SELL')),
    quantity DECIMAL(15,4) NOT NULL,
    price DECIMAL(10,4),
    order_type VARCHAR(10) CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP', 'STOP_LOSS')),
    status VARCHAR(15) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED')),
    filled_quantity DECIMAL(15,4) DEFAULT 0,
    filled_price DECIMAL(10,4),
    commission DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    filled_at TIMESTAMPTZ
);

-- User watchlists
CREATE TABLE watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watchlist_symbols (
    watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (watchlist_id, symbol, exchange)
);

-- Price alerts
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    condition_type VARCHAR(20) CHECK (condition_type IN ('PRICE_ABOVE', 'PRICE_BELOW', 'VOLUME_ABOVE', 'PERCENT_CHANGE')),
    threshold_value DECIMAL(15,4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_triggered BOOLEAN DEFAULT false,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    triggered_at TIMESTAMPTZ
);