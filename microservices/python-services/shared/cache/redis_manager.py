import json
from shared.database.connections import db

class RedisManager:
    @staticmethod
    async def set(key, value, ttl=3600):
        await db.redis_client.setex(key, ttl, json.dumps(value, default=str))

    @staticmethod
    async def get(key):
        value = await db.redis_client.get(key)
        return json.loads(value) if value else None

    @staticmethod
    async def delete(key):
        await db.redis_client.delete(key)

    @staticmethod
    async def publish(channel, message):
        await db.redis_client.publish(channel, json.dumps(message, default=str))

    @staticmethod
    async def cache_market_data(symbol, exchange, data, ttl=60):
        key = f"market:{symbol}:{exchange}"
        await RedisManager.set(key, data, ttl)

    @staticmethod
    async def cache_user_session(user_id, session_data, ttl=86400):
        key = f"session:{user_id}"
        await RedisManager.set(key, session_data, ttl)

    @staticmethod
    async def cache_portfolio(user_id, portfolio_data, ttl=1800):
        key = f"portfolio:{user_id}"
        await RedisManager.set(key, portfolio_data, ttl)