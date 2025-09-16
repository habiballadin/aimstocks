from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from shared.database.connections import db
from datetime import datetime, timedelta

router = APIRouter()

class RefreshTokenRequest(BaseModel):
    user_id: int
    refresh_token: str

@router.post("/refresh-token")
async def refresh_fyers_token(request: RefreshTokenRequest):
    """Refresh Fyers access token using refresh token"""
    try:
        # Verify refresh token exists and is valid
        query = """
            SELECT refresh_token, refresh_expires_at 
            FROM user_tokens 
            WHERE user_id = $1 AND token_type = 'fyers_access' 
            AND refresh_token = $2 AND refresh_expires_at > NOW() 
            AND is_revoked = false
        """
        
        async with db.pg_pool.acquire() as conn:
            token_row = await conn.fetchrow(query, request.user_id, request.refresh_token)
            
        if not token_row:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
        # Call Fyers API to refresh token
        refresh_response = requests.post('https://api-t2.fyers.in/vagator/v2/refresh_access_token', 
            json={
                'grant_type': 'refresh_token',
                'appIdHash': 'QkFFSzJZQ042Ui0xMDA6NlJJVFVUUFkyRA==',
                'refresh_token': request.refresh_token
            })
        
        refresh_data = refresh_response.json()
        
        if 'access_token' in refresh_data:
            new_access_token = refresh_data['access_token']
            new_refresh_token = refresh_data.get('refresh_token', request.refresh_token)
            
            # Update tokens in database
            update_query = """
                UPDATE user_tokens 
                SET token_hash = $1, 
                    refresh_token = $2,
                    expires_at = $3,
                    refresh_expires_at = $4,
                    updated_at = NOW()
                WHERE user_id = $5 AND token_type = 'fyers_access'
            """
            
            expires_at = datetime.now() + timedelta(hours=24)
            refresh_expires_at = datetime.now() + timedelta(days=30)
            
            async with db.pg_pool.acquire() as conn:
                await conn.execute(update_query, 
                    new_access_token, new_refresh_token, 
                    expires_at, refresh_expires_at, request.user_id)
            
            return {
                'success': True, 
                'access_token': new_access_token,
                'refresh_token': new_refresh_token,
                'expires_in': 86400
            }
        else:
            raise HTTPException(status_code=400, detail=refresh_data.get('message', 'Token refresh failed'))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/revoke-token")
async def revoke_token(request: dict):
    """Revoke user tokens"""
    try:
        user_id = request.get('user_id')
        
        query = """
            UPDATE user_tokens 
            SET is_revoked = true, updated_at = NOW()
            WHERE user_id = $1 AND token_type = 'fyers_access'
        """
        
        async with db.pg_pool.acquire() as conn:
            await conn.execute(query, user_id)
            
        return {'success': True, 'message': 'Token revoked successfully'}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))