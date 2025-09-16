from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database.connections import db
from typing import Optional

router = APIRouter()

class UserProfileRequest(BaseModel):
    user_id: int
    fy_id: Optional[str] = None
    display_name: Optional[str] = None
    mobile_number: Optional[str] = None
    pan: Optional[str] = None
    totp_enabled: bool = False
    ddpi_enabled: bool = False
    mtf_enabled: bool = False

@router.post("/user-profiles")
async def store_user_profile(request: UserProfileRequest):
    """Store user profile in database"""
    try:
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
            RETURNING id
        """
        
        async with db.pg_pool.acquire() as conn:
            profile_id = await conn.fetchval(query,
                request.user_id, request.fy_id, request.display_name,
                request.mobile_number, request.pan, request.totp_enabled,
                request.ddpi_enabled, request.mtf_enabled)
            
        return {"success": True, "profile_id": profile_id, "message": "Profile stored successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-profiles/{user_id}")
async def get_user_profile(user_id: int):
    """Get user profile"""
    try:
        query = """
            SELECT * FROM user_profiles WHERE user_id = $1
        """
        
        async with db.pg_pool.acquire() as conn:
            row = await conn.fetchrow(query, user_id)
            
        if row:
            return {"success": True, "profile": dict(row)}
        else:
            return {"success": False, "message": "Profile not found"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))