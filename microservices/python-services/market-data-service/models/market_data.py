from shared.database.connections import db
import json
from datetime import datetime

class MarketData:
    @staticmethod
    async def insert_tick(tick_data):
        query = """
            INSERT INTO market_data (time, symbol, exchange, ltp, open_price, high_price, 
                                   low_price, prev_close, change_value, change_percent, 
                                   volume, bid, ask)
            VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """
        async with db.pg_pool.acquire() as conn:
            await conn.execute(query, 
                tick_data['symbol'], tick_data['exchange'], tick_data['ltp'],
                tick_data.get('open_price'), tick_data.get('high_price'),
                tick_data.get('low_price'), tick_data.get('prev_close'),
                tick_data.get('change_value'), tick_data.get('change_percent'),
                tick_data.get('volume'), tick_data.get('bid'), tick_data.get('ask'))
        
        # Cache latest price
        cache_key = f"price:{tick_data['symbol']}:{tick_data['exchange']}"
        await db.redis_client.setex(cache_key, 60, json.dumps(tick_data))

    @staticmethod
    async def get_latest_price(symbol, exchange):
        cache_key = f"price:{symbol}:{exchange}"
        cached = await db.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        query = """
            SELECT * FROM market_data 
            WHERE symbol = $1 AND exchange = $2 
            ORDER BY time DESC LIMIT 1
        """
        async with db.pg_pool.acquire() as conn:
            row = await conn.fetchrow(query, symbol, exchange)
            return dict(row) if row else None

    @staticmethod
    async def get_historical_data(symbol, exchange, timeframe, limit=100):
        query = """
            SELECT * FROM historical_data 
            WHERE symbol = $1 AND exchange = $2 AND timeframe = $3
            ORDER BY time DESC LIMIT $4
        """
        async with db.pg_pool.acquire() as conn:
            rows = await conn.fetch(query, symbol, exchange, timeframe, limit)
            return [dict(row) for row in rows]