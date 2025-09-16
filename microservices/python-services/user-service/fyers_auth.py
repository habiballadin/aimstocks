from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
from shared.database.connections import db
from datetime import datetime, timedelta

router = APIRouter()

class FyersAuthRequest(BaseModel):
    user_id: int
    access_token: str

class FyersAuthResponse(BaseModel):
    success: bool
    message: str
    profile: dict = None

@router.post("/connect-fyers", response_model=FyersAuthResponse)
async def connect_fyers(auth_request: FyersAuthRequest):
    """Connect user to Fyers and store token + profile"""
    try:
        headers = {"Authorization": f"Bearer {auth_request.access_token}"}
        response = requests.get("https://api-t1.fyers.in/api/v3/profile", headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Fyers token")
        
        profile_data = response.json().get('data', {})
        
        await store_fyers_token(auth_request.user_id, auth_request.access_token)
        await store_user_profile(auth_request.user_id, profile_data)
        
        funds_response = requests.get("https://api-t1.fyers.in/api/v3/funds", headers=headers)
        if funds_response.status_code == 200:
            funds_data = funds_response.json().get('fund_limit', [])
            await store_user_funds(auth_request.user_id, funds_data)
        
        return FyersAuthResponse(
            success=True,
            message="Successfully connected to Fyers",
            profile=profile_data
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fyers-status/{user_id}")
async def get_fyers_status(user_id: int):
    """Check if user has valid Fyers connection"""
    try:
        query = "SELECT COUNT(*) FROM user_tokens WHERE user_id = $1 AND token_type = 'fyers_access' AND expires_at > NOW() AND is_revoked = false"
        async with db.pg_pool.acquire() as conn:
            count = await conn.fetchval(query, user_id)
            return {"connected": count > 0, "user_id": user_id}
    except Exception as e:
        return {"connected": False, "error": str(e)}

@router.get("/fyers-auth-url")
async def get_fyers_auth_url():
    """Get Fyers authentication URL"""
    try:
        APP_ID = "BAEK2YCN6R-100"
        REDIRECT_URI = "http://localhost:5173/auth/callback"
        
        auth_url = f"https://api.fyers.in/api/v2/auth?client_id={APP_ID}&redirect_uri={REDIRECT_URI}&response_type=code&state=sample_state"
        
        return {
            "success": True,
            "auth_url": auth_url
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/exchange-code")
async def exchange_auth_code(request: dict):
    """Exchange auth code for access token and store in database"""
    try:
        auth_code = request.get('auth_code')
        user_id = request.get('user_id', 1)
        
        # Exchange code for token with Fyers API
        token_response = requests.post('https://api.fyers.in/api/v2/generate_access_token', 
            json={
                'grant_type': 'authorization_code',
                'appIdHash': 'QkFFSzJZQ042Ui0xMDA6NlJJVFVUUFkyRA==',  # Base64 of APP_ID:SECRET_ID
                'code': auth_code
            })
        
        token_data = token_response.json()
        
        if 'access_token' in token_data:
            access_token = token_data['access_token']
            
            # Store token and get profile
            await store_fyers_token(user_id, access_token)
            
            # Get and store profile
            profile_response = requests.get('https://api-t1.fyers.in/api/v3/profile', 
                headers={'Authorization': f'Bearer {access_token}'})
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json().get('data', {})
                await store_user_profile(user_id, profile_data)
            
            return {'success': True, 'access_token': access_token, 'message': 'Token stored successfully'}
        else:
            return {'success': False, 'message': token_data.get('message', 'Failed to get token')}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def store_fyers_token(user_id: int, access_token: str):
    """Store Fyers access token"""
    expires_at = datetime.now() + timedelta(hours=24)
    
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

async def store_user_profile(user_id: int, profile_data: dict):
    """Store user profile from Fyers"""
    query = """
        INSERT INTO user_profiles (user_id, fy_id, display_name, mobile_number, pan, totp_enabled, ddpi_enabled, mtf_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) DO UPDATE SET
            fy_id = EXCLUDED.fy_id,
            display_name = EXCLUDED.display_name,
            mobile_number = EXCLUDED.mobile_number,
            pan = EXCLUDED.pan,
            totp_enabled = EXCLUDED.totp_enabled,
            ddpi_enabled = EXCLUDED.ddpi_enabled,
            mtf_enabled = EXCLUDED.mtf_enabled,
            updated_at = NOW()
    """
    async with db.pg_pool.acquire() as conn:
        await conn.execute(query,
            user_id,
            profile_data.get('fy_id'),
            profile_data.get('display_name'),
            profile_data.get('mobile_number'),
            profile_data.get('PAN'),
            profile_data.get('totp', False),
            profile_data.get('ddpi_enabled', False),
            profile_data.get('mtf_enabled', False)
        )

async def store_user_funds(user_id: int, funds_data: list):
    """Store user funds from Fyers"""
    for fund in funds_data:
        query = """
            INSERT INTO funds (user_id, title, equity_amount, commodity_amount, available_margin, used_margin)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, title) DO UPDATE SET
                equity_amount = EXCLUDED.equity_amount,
                commodity_amount = EXCLUDED.commodity_amount,
                available_margin = EXCLUDED.available_margin,
                used_margin = EXCLUDED.used_margin,
                updated_at = NOW()
        """
        async with db.pg_pool.acquire() as conn:
            await conn.execute(query,
                user_id,
                fund.get('title', 'Default'),
                float(fund.get('equityAmount', 0)),
                float(fund.get('commodityAmount', 0)),
                float(fund.get('availableBalance', 0)),
                float(fund.get('utilizedAmount', 0))
            )