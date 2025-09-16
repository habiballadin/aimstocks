from shared.database.connections import db
import json

class User:
    @staticmethod
    async def create(user_data):
        query = """
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        """
        async with db.pg_pool.acquire() as conn:
            row = await conn.fetchrow(query, 
                user_data['username'], user_data['email'], 
                user_data['password_hash'], user_data.get('first_name'), 
                user_data.get('last_name'))
            return dict(row)

    @staticmethod
    async def find_by_email(email):
        query = "SELECT * FROM users WHERE email = $1"
        async with db.pg_pool.acquire() as conn:
            row = await conn.fetchrow(query, email)
            return dict(row) if row else None

    @staticmethod
    async def find_by_id(user_id):
        cache_key = f"user:{user_id}"
        cached = await db.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        query = "SELECT * FROM users WHERE id = $1"
        async with db.pg_pool.acquire() as conn:
            row = await conn.fetchrow(query, user_id)
            if row:
                user_data = dict(row)
                await db.redis_client.setex(cache_key, 3600, json.dumps(user_data, default=str))
                return user_data
        return None