const { pgPool } = require('../config/database');

class Portfolio {
  static async create(userId, name) {
    const query = `
      INSERT INTO portfolios (user_id, name, is_default)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const isDefault = await this.getUserPortfolioCount(userId) === 0;
    const result = await pgPool.query(query, [userId, name, isDefault]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM portfolios WHERE user_id = $1';
    const result = await pgPool.query(query, [userId]);
    return result.rows;
  }

  static async updateValue(portfolioId) {
    const query = 'SELECT calculate_portfolio_value($1)';
    await pgPool.query(query, [portfolioId]);
  }

  static async getUserPortfolioCount(userId) {
    const query = 'SELECT COUNT(*) FROM portfolios WHERE user_id = $1';
    const result = await pgPool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Portfolio;