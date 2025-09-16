const { pgPool } = require('../config/database');

class Order {
  static async create(orderData) {
    const { user_id, portfolio_id, symbol, exchange, side, quantity, price, order_type } = orderData;
    const query = `
      INSERT INTO orders (user_id, portfolio_id, symbol, exchange, side, quantity, price, order_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    const result = await pgPool.query(query, [user_id, portfolio_id, symbol, exchange, side, quantity, price, order_type]);
    return result.rows[0];
  }

  static async execute(orderId, executionPrice) {
    const query = 'SELECT execute_order($1, $2)';
    const result = await pgPool.query(query, [orderId, executionPrice]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pgPool.query(query, [userId]);
    return result.rows;
  }

  static async findPendingOrders() {
    const query = 'SELECT * FROM orders WHERE status = $1';
    const result = await pgPool.query(query, ['PENDING']);
    return result.rows;
  }
}

module.exports = Order;