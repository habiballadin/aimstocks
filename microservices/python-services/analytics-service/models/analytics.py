from shared.database.connections import db
import json

class Analytics:
    @staticmethod
    def insert_trade_execution(trade_data):
        query = """
            INSERT INTO trade_executions (timestamp, user_id, symbol, side, quantity, price, commission)
            VALUES (%(timestamp)s, %(user_id)s, %(symbol)s, %(side)s, %(quantity)s, %(price)s, %(commission)s)
        """
        db.clickhouse_client.execute(query, trade_data)

    @staticmethod
    def insert_portfolio_snapshot(snapshot_data):
        query = """
            INSERT INTO portfolio_snapshots (timestamp, user_id, portfolio_id, total_value, cash_balance, positions_value)
            VALUES (%(timestamp)s, %(user_id)s, %(portfolio_id)s, %(total_value)s, %(cash_balance)s, %(positions_value)s)
        """
        db.clickhouse_client.execute(query, snapshot_data)

    @staticmethod
    def get_trading_performance(user_id, start_date, end_date):
        query = """
            SELECT 
                date,
                total_trades,
                winning_trades,
                losing_trades,
                total_pnl,
                win_rate
            FROM trading_performance
            WHERE user_id = %(user_id)s 
            AND date BETWEEN %(start_date)s AND %(end_date)s
            ORDER BY date
        """
        return db.clickhouse_client.execute(query, {
            'user_id': user_id,
            'start_date': start_date,
            'end_date': end_date
        })

    @staticmethod
    async def get_portfolio_performance(user_id, portfolio_id):
        cache_key = f"performance:{user_id}:{portfolio_id}"
        cached = await db.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        query = """
            SELECT 
                date,
                daily_value
            FROM portfolio_performance_daily
            WHERE user_id = %(user_id)s AND portfolio_id = %(portfolio_id)s
            ORDER BY date DESC
            LIMIT 30
        """
        result = db.clickhouse_client.execute(query, {
            'user_id': user_id,
            'portfolio_id': portfolio_id
        })
        
        await db.redis_client.setex(cache_key, 300, json.dumps(result))
        return result