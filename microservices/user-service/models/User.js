const { pgPool } = require('../config/database');

class User {
  static async create(userData) {
    const { username, email, password_hash, first_name, last_name } = userData;
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pgPool.query(query, [username, email, password_hash, first_name, last_name]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pgPool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = User;