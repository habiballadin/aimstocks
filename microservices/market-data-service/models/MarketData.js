const { pgPool } = require('../config/database');

class MarketData {
  static async insertTick(tickData) {
    const query = `
      INSERT INTO market_data (time, symbol, exchange, ltp, open_price, high_price, low_price, prev_close, change_value, change_percent, volume, bid, ask)
      VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    const { symbol, exchange, ltp, open_price, high_price, low_price, prev_close, change_value, change_percent, volume, bid, ask } = tickData;
    await pgPool.query(query, [symbol, exchange, ltp, open_price, high_price, low_price, prev_close, change_value, change_percent, volume, bid, ask]);
  }

  static async getLatestPrice(symbol, exchange) {
    const query = `
      SELECT * FROM market_data 
      WHERE symbol = $1 AND exchange = $2 
      ORDER BY time DESC LIMIT 1
    `;
    const result = await pgPool.query(query, [symbol, exchange]);
    return result.rows[0];
  }

  static async getHistoricalData(symbol, exchange, timeframe, limit = 100) {
    const query = `
      SELECT * FROM historical_data 
      WHERE symbol = $1 AND exchange = $2 AND timeframe = $3
      ORDER BY time DESC LIMIT $4
    `;
    const result = await pgPool.query(query, [symbol, exchange, timeframe, limit]);
    return result.rows;
  }
}

module.exports = MarketData;