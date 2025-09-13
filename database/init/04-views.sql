-- Database Views for AimStocks

USE aimstocks;

-- Portfolio Performance View
CREATE VIEW portfolio_performance AS
SELECT 
    p.id as portfolio_id,
    p.user_id,
    p.name as portfolio_name,
    p.total_value,
    SUM(h.pnl) as total_pnl,
    (SUM(h.pnl) / SUM(h.quantity * h.avg_price)) * 100 as total_pnl_percent,
    COUNT(h.id) as total_holdings,
    SUM(CASE WHEN h.pnl > 0 THEN 1 ELSE 0 END) as profitable_holdings,
    SUM(CASE WHEN h.pnl < 0 THEN 1 ELSE 0 END) as loss_holdings
FROM portfolios p
LEFT JOIN holdings h ON p.id = h.portfolio_id
GROUP BY p.id, p.user_id, p.name, p.total_value;

-- User Watchlist with Market Data
CREATE VIEW user_watchlist_data AS
SELECT 
    w.user_id,
    w.symbol,
    w.exchange,
    m.ltp,
    m.change_value,
    m.change_percent,
    m.volume,
    m.updated_at
FROM watchlist w
LEFT JOIN market_data m ON w.symbol = m.symbol AND w.exchange = m.exchange
ORDER BY w.user_id, w.sort_order;

-- Active Orders View
CREATE VIEW active_orders AS
SELECT 
    o.id,
    o.user_id,
    o.symbol,
    o.order_type,
    o.quantity,
    o.price,
    o.status,
    o.created_at,
    m.ltp as current_price
FROM orders o
LEFT JOIN market_data m ON o.symbol = m.symbol
WHERE o.status IN ('PENDING', 'OPEN')
ORDER BY o.created_at DESC;

-- Algorithm Performance View
CREATE VIEW algorithm_performance AS
SELECT 
    a.id as algorithm_id,
    a.user_id,
    a.name,
    a.status,
    COUNT(ae.id) as total_executions,
    SUM(CASE WHEN ae.status = 'EXECUTED' THEN 1 ELSE 0 END) as successful_executions,
    AVG(ae.confidence) as avg_confidence,
    MAX(ae.executed_at) as last_execution
FROM algorithms a
LEFT JOIN algorithm_executions ae ON a.id = ae.algorithm_id
GROUP BY a.id, a.user_id, a.name, a.status;

-- Market Movers View
CREATE VIEW market_movers AS
SELECT 
    symbol,
    exchange,
    ltp,
    change_value,
    change_percent,
    volume,
    CASE 
        WHEN change_percent >= 5 THEN 'STRONG_GAINER'
        WHEN change_percent >= 2 THEN 'GAINER'
        WHEN change_percent <= -5 THEN 'STRONG_LOSER'
        WHEN change_percent <= -2 THEN 'LOSER'
        ELSE 'NEUTRAL'
    END as movement_category
FROM market_data
WHERE ABS(change_percent) >= 1
ORDER BY ABS(change_percent) DESC;

-- User Trading Summary
CREATE VIEW user_trading_summary AS
SELECT 
    u.id as user_id,
    u.name,
    COUNT(DISTINCT p.id) as total_portfolios,
    SUM(p.total_value) as total_portfolio_value,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'COMPLETE' THEN o.id END) as completed_orders,
    COUNT(DISTINCT w.id) as watchlist_count,
    COUNT(DISTINCT a.id) as active_algorithms
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN watchlist w ON u.id = w.user_id
LEFT JOIN algorithms a ON u.id = a.user_id AND a.is_active = TRUE
GROUP BY u.id, u.name;