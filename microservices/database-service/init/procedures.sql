-- Stored procedures for AimStocks

-- Calculate portfolio total value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(portfolio_id_param INTEGER)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    total_value DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(market_value), 0) INTO total_value
    FROM holdings
    WHERE portfolio_id = portfolio_id_param;
    
    UPDATE portfolios
    SET total_value = total_value + cash_balance,
        updated_at = NOW()
    WHERE id = portfolio_id_param;
    
    RETURN total_value;
END;
$$ LANGUAGE plpgsql;

-- Update holdings with current market prices
CREATE OR REPLACE FUNCTION update_holdings_prices()
RETURNS VOID AS $$
BEGIN
    UPDATE holdings h
    SET
        current_price = m.ltp,
        market_value = h.quantity * m.ltp,
        pnl = (h.quantity * m.ltp) - (h.quantity * h.avg_cost),
        pnl_percent = CASE
            WHEN h.avg_cost > 0 THEN ((m.ltp - h.avg_cost) / h.avg_cost) * 100
            ELSE 0
        END,
        updated_at = NOW()
    FROM (
        SELECT DISTINCT ON (symbol, exchange) 
            symbol, exchange, ltp
        FROM market_data
        ORDER BY symbol, exchange, time DESC
    ) m
    WHERE h.symbol = m.symbol AND h.exchange = m.exchange;
END;
$$ LANGUAGE plpgsql;

-- Process order execution
CREATE OR REPLACE FUNCTION execute_order(order_id_param INTEGER, execution_price DECIMAL(10,4))
RETURNS BOOLEAN AS $$
DECLARE
    order_rec RECORD;
    holding_rec RECORD;
BEGIN
    SELECT * INTO order_rec FROM orders WHERE id = order_id_param AND status = 'PENDING';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update order status
    UPDATE orders
    SET status = 'FILLED',
        filled_quantity = quantity,
        filled_price = execution_price,
        filled_at = NOW()
    WHERE id = order_id_param;
    
    -- Update or create holding
    IF order_rec.side = 'BUY' THEN
        INSERT INTO holdings (portfolio_id, symbol, exchange, quantity, avg_cost)
        VALUES (order_rec.portfolio_id, order_rec.symbol, order_rec.exchange, order_rec.quantity, execution_price)
        ON CONFLICT (portfolio_id, symbol, exchange)
        DO UPDATE SET
            quantity = holdings.quantity + order_rec.quantity,
            avg_cost = ((holdings.quantity * holdings.avg_cost) + (order_rec.quantity * execution_price)) / (holdings.quantity + order_rec.quantity),
            updated_at = NOW();
    ELSE
        UPDATE holdings
        SET quantity = quantity - order_rec.quantity,
            updated_at = NOW()
        WHERE portfolio_id = order_rec.portfolio_id
        AND symbol = order_rec.symbol
        AND exchange = order_rec.exchange;
        
        DELETE FROM holdings
        WHERE portfolio_id = order_rec.portfolio_id
        AND symbol = order_rec.symbol
        AND exchange = order_rec.exchange
        AND quantity <= 0;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;