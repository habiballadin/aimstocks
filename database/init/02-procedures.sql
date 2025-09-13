-- Stored Procedures and Functions for AimStocks

USE aimstocks;

DELIMITER //

-- Calculate Portfolio Value
CREATE PROCEDURE CalculatePortfolioValue(IN portfolio_id INT)
BEGIN
    DECLARE total_value DECIMAL(15,2) DEFAULT 0;
    
    SELECT SUM(quantity * current_price) INTO total_value
    FROM holdings 
    WHERE holdings.portfolio_id = portfolio_id;
    
    UPDATE portfolios 
    SET total_value = COALESCE(total_value, 0)
    WHERE id = portfolio_id;
END //

-- Update Holdings PnL
CREATE PROCEDURE UpdateHoldingsPnL(IN portfolio_id INT)
BEGIN
    UPDATE holdings h
    JOIN market_data m ON h.symbol = m.symbol AND h.exchange = m.exchange
    SET 
        h.current_price = m.ltp,
        h.market_value = h.quantity * m.ltp,
        h.pnl = (h.quantity * m.ltp) - (h.quantity * h.avg_price),
        h.pnl_percent = ((m.ltp - h.avg_price) / h.avg_price) * 100
    WHERE h.portfolio_id = portfolio_id;
END //

-- Get Portfolio Summary
CREATE PROCEDURE GetPortfolioSummary(IN user_id INT)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.total_value,
        SUM(h.pnl) as total_pnl,
        AVG(h.pnl_percent) as avg_pnl_percent,
        COUNT(h.id) as total_holdings
    FROM portfolios p
    LEFT JOIN holdings h ON p.id = h.portfolio_id
    WHERE p.user_id = user_id
    GROUP BY p.id, p.name, p.total_value;
END //

-- Check Alert Conditions
CREATE PROCEDURE CheckAlerts()
BEGIN
    -- Price above alerts
    UPDATE alerts a
    JOIN market_data m ON a.symbol = m.symbol
    SET a.is_triggered = TRUE, a.triggered_at = NOW()
    WHERE a.alert_type = 'PRICE_ABOVE' 
    AND m.ltp >= a.condition_value 
    AND a.is_active = TRUE 
    AND a.is_triggered = FALSE;
    
    -- Price below alerts
    UPDATE alerts a
    JOIN market_data m ON a.symbol = m.symbol
    SET a.is_triggered = TRUE, a.triggered_at = NOW()
    WHERE a.alert_type = 'PRICE_BELOW' 
    AND m.ltp <= a.condition_value 
    AND a.is_active = TRUE 
    AND a.is_triggered = FALSE;
END //

-- Get Top Gainers
CREATE PROCEDURE GetTopGainers(IN limit_count INT)
BEGIN
    SELECT symbol, ltp, change_percent
    FROM market_data
    WHERE change_percent > 0
    ORDER BY change_percent DESC
    LIMIT limit_count;
END //

-- Get Top Losers
CREATE PROCEDURE GetTopLosers(IN limit_count INT)
BEGIN
    SELECT symbol, ltp, change_percent
    FROM market_data
    WHERE change_percent < 0
    ORDER BY change_percent ASC
    LIMIT limit_count;
END //

DELIMITER ;