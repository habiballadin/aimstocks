-- PostgreSQL Stored Procedures and Functions for AimStocks

-- Calculate Portfolio Value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(portfolio_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    total_value DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(quantity * current_price), 0) INTO total_value
    FROM holdings
    WHERE portfolio_id = portfolio_id_param;

    UPDATE portfolios
    SET total_value = total_value
    WHERE id = portfolio_id_param;
END;
$$ LANGUAGE plpgsql;

-- Update Holdings PnL
CREATE OR REPLACE FUNCTION update_holdings_pnl(portfolio_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE holdings h
    SET
        current_price = m.ltp,
        market_value = h.quantity * m.ltp,
        pnl = (h.quantity * m.ltp) - (h.quantity * h.avg_price),
        pnl_percent = CASE
            WHEN h.avg_price > 0 THEN ((m.ltp - h.avg_price) / h.avg_price) * 100
            ELSE 0
        END,
        updated_at = CURRENT_TIMESTAMP
    FROM market_data m
    WHERE h.symbol = m.symbol
    AND h.exchange = m.exchange
    AND h.portfolio_id = portfolio_id_param
    AND m.timestamp = (
        SELECT MAX(timestamp)
        FROM market_data m2
        WHERE m2.symbol = h.symbol AND m2.exchange = h.exchange
    );
END;
$$ LANGUAGE plpgsql;

-- Get Portfolio Summary
CREATE OR REPLACE FUNCTION get_portfolio_summary(user_id_param INTEGER)
RETURNS TABLE (
    portfolio_id INTEGER,
    portfolio_name VARCHAR(100),
    total_value DECIMAL(15,2),
    total_pnl DECIMAL(15,2),
    avg_pnl_percent DECIMAL(7,2),
    total_holdings BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.total_value,
        COALESCE(SUM(h.pnl), 0)::DECIMAL(15,2) as total_pnl,
        COALESCE(AVG(h.pnl_percent), 0)::DECIMAL(7,2) as avg_pnl_percent,
        COUNT(h.id) as total_holdings
    FROM portfolios p
    LEFT JOIN holdings h ON p.id = h.portfolio_id
    WHERE p.user_id = user_id_param
    GROUP BY p.id, p.name, p.total_value;
END;
$$ LANGUAGE plpgsql;

-- Check Alert Conditions
CREATE OR REPLACE FUNCTION check_alerts()
RETURNS VOID AS $$
BEGIN
    -- Price above alerts
    UPDATE alerts a
    SET is_triggered = TRUE, triggered_at = CURRENT_TIMESTAMP
    FROM market_data m
    WHERE a.symbol = m.symbol
    AND a.alert_type = 'PRICE_ABOVE'
    AND m.ltp >= a.condition_value
    AND a.is_active = TRUE
    AND a.is_triggered = FALSE
    AND m.timestamp = (
        SELECT MAX(timestamp)
        FROM market_data m2
        WHERE m2.symbol = a.symbol
    );

    -- Price below alerts
    UPDATE alerts a
    SET is_triggered = TRUE, triggered_at = CURRENT_TIMESTAMP
    FROM market_data m
    WHERE a.symbol = m.symbol
    AND a.alert_type = 'PRICE_BELOW'
    AND m.ltp <= a.condition_value
    AND a.is_active = TRUE
    AND a.is_triggered = FALSE
    AND m.timestamp = (
        SELECT MAX(timestamp)
        FROM market_data m2
        WHERE m2.symbol = a.symbol
    );
END;
$$ LANGUAGE plpgsql;

-- Get Top Gainers
CREATE OR REPLACE FUNCTION get_top_gainers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    symbol VARCHAR(20),
    ltp DECIMAL(10,2),
    change_percent DECIMAL(7,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.symbol,
        m.ltp,
        m.change_percent
    FROM market_data m
    WHERE m.change_percent > 0
    AND m.timestamp = (
        SELECT MAX(timestamp)
        FROM market_data m2
        WHERE m2.symbol = m.symbol
    )
    ORDER BY m.change_percent DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get Top Losers
CREATE OR REPLACE FUNCTION get_top_losers(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    symbol VARCHAR(20),
    ltp DECIMAL(10,2),
    change_percent DECIMAL(7,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.symbol,
        m.ltp,
        m.change_percent
    FROM market_data m
    WHERE m.change_percent < 0
    AND m.timestamp = (
        SELECT MAX(timestamp)
        FROM market_data m2
        WHERE m2.symbol = m.symbol
    )
    ORDER BY m.change_percent ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
