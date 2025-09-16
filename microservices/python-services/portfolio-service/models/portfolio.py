from shared.database.connections import db
import json

class Portfolio:
    @staticmethod
    async def create(user_id, name):
        query = """
            INSERT INTO portfolios (user_id, name, is_default)
            VALUES ($1, $2, $3) RETURNING *
        """
        count_query = "SELECT COUNT(*) FROM portfolios WHERE user_id = $1"
        async with db.pg_pool.acquire() as conn:
            count = await conn.fetchval(count_query, user_id)
            is_default = count == 0
            row = await conn.fetchrow(query, user_id, name, is_default)
            return dict(row)

    @staticmethod
    async def find_by_user_id(user_id):
        cache_key = f"portfolios:{user_id}"
        cached = await db.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        query = "SELECT * FROM portfolios WHERE user_id = $1"
        async with db.pg_pool.acquire() as conn:
            rows = await conn.fetch(query, user_id)
            portfolios = [dict(row) for row in rows]
            await db.redis_client.setex(cache_key, 1800, json.dumps(portfolios, default=str))
            return portfolios

    @staticmethod
    async def update_value(portfolio_id):
        query = "SELECT calculate_portfolio_value($1)"
        async with db.pg_pool.acquire() as conn:
            await conn.execute(query, portfolio_id)