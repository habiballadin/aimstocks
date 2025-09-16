from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database.connections import db
from datetime import datetime
from typing import Optional

router = APIRouter()

class UserTokenRequest(BaseModel):
    user_id: int
    token: str
    refresh_token: Optional[str] = None
    token_type: str
    expires_at: Optional[str] = None
    refresh_expires_at: Optional[str] = None

@router.post("/user-tokens")
async def store_user_token(request: UserTokenRequest):
    """Store user token in database"""
    try:
        expires_at = None
        refresh_expires_at = None
        
        if request.expires_at:
            expires_at = datetime.fromisoformat(request.expires_at.replace('Z', '+00:00'))
        if request.refresh_expires_at:
            refresh_expires_at = datetime.fromisoformat(request.refresh_expires_at.replace('Z', '+00:00'))
        
        query = """
            INSERT INTO user_tokens (user_id, token_hash, refresh_token, token_type, expires_at, refresh_expires_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, token_type) DO UPDATE SET
                token_hash = EXCLUDED.token_hash,
                refresh_token = EXCLUDED.refresh_token,
                expires_at = EXCLUDED.expires_at,
                refresh_expires_at = EXCLUDED.refresh_expires_at,
                is_revoked = false,
                updated_at = NOW()
            RETURNING id
        """
        
        async with db.pg_pool.acquire() as conn:
            token_id = await conn.fetchval(query, 
                request.user_id, request.token, request.refresh_token, 
                request.token_type, expires_at, refresh_expires_at)
            
        return {"success": True, "token_id": token_id, "message": "Token stored successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-tokens/{user_id}")
async def get_user_tokens(user_id: int):
    """Get all tokens for a user"""
    try:
        query = """
            SELECT id, token_type, expires_at, refresh_expires_at, is_revoked, created_at
            FROM user_tokens 
            WHERE user_id = $1
            ORDER BY created_at DESC
        """
        
        async with db.pg_pool.acquire() as conn:
            rows = await conn.fetch(query, user_id)
            tokens = [dict(row) for row in rows]
            
        return {"success": True, "tokens": tokens}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))