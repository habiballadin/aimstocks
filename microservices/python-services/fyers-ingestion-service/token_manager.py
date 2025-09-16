from shared.database.connections import db
from datetime import datetime, timedelta

class TokenManager:
    @staticmethod
    async def store_fyers_token(user_id, access_token, expires_in_seconds=86400):
        """Store Fyers access token in database"""
        expires_at = datetime.now() + timedelta(seconds=expires_in_seconds)
        
        query = """
            INSERT INTO user_tokens (user_id, token_hash, token_type, expires_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, token_type) DO UPDATE SET
                token_hash = EXCLUDED.token_hash,
                expires_at = EXCLUDED.expires_at,
                is_revoked = false
        """
        async with db.pg_pool.acquire() as conn:
            await conn.execute(query, user_id, access_token, 'fyers_access', expires_at)

    @staticmethod
    async def get_valid_token(user_id):
        """Get valid Fyers token for user"""
        query = """
            SELECT token_hash FROM user_tokens 
            WHERE user_id = $1 AND token_type = 'fyers_access' 
            AND expires_at > NOW() AND is_revoked = false
        """
        async with db.pg_pool.acquire() as conn:
            result = await conn.fetchval(query, user_id)
            return result

    @staticmethod
    async def revoke_token(user_id):
        """Revoke Fyers token"""
        query = """
            UPDATE user_tokens SET is_revoked = true 
            WHERE user_id = $1 AND token_type = 'fyers_access'
        """
        async with db.pg_pool.acquire() as conn:
            await conn.execute(query, user_id)