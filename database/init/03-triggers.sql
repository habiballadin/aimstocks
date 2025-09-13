-- Database Triggers for AimStocks

USE aimstocks;

DELIMITER //

-- Update portfolio value when holdings change
CREATE TRIGGER update_portfolio_on_holding_change
AFTER UPDATE ON holdings
FOR EACH ROW
BEGIN
    CALL CalculatePortfolioValue(NEW.portfolio_id);
END //

-- Update portfolio value when new holding is added
CREATE TRIGGER update_portfolio_on_holding_insert
AFTER INSERT ON holdings
FOR EACH ROW
BEGIN
    CALL CalculatePortfolioValue(NEW.portfolio_id);
END //

-- Update portfolio value when holding is deleted
CREATE TRIGGER update_portfolio_on_holding_delete
AFTER DELETE ON holdings
FOR EACH ROW
BEGIN
    CALL CalculatePortfolioValue(OLD.portfolio_id);
END //

-- Auto-update timestamps
CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

-- Log order status changes
CREATE TRIGGER log_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO order_logs (order_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
END //

DELIMITER ;

-- Create order logs table for the trigger
CREATE TABLE order_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);