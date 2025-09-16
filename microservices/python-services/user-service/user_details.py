from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database.connections import db
from typing import Optional

router = APIRouter()

class UserDetailsRequest(BaseModel):
    user_id: int
    username: Optional[str] = None
    email: Optional[str] = None
    fy_id: Optional[str] = None
    name: Optional[str] = None
    display_name: Optional[str] = None
    mobile_number: Optional[str] = None
    pan: Optional[str] = None

@router.post("/user-details")
async def store_user_details(request: UserDetailsRequest):
    """Store user details if not exists"""
    try:
        # Check if user details already exist
        check_query = "SELECT id FROM user_details WHERE user_id = $1"
        async with db.pg_pool.acquire() as conn:
            existing = await conn.fetchval(check_query, request.user_id)
            
        if existing:
            return {"success": True, "message": "User details already exist", "user_detail_id": existing}
        
        # Insert new user details
        insert_query = """
            INSERT INTO user_details (user_id, username, email, fy_id, name, display_name, mobile_number, pan)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        """
        
        async with db.pg_pool.acquire() as conn:
            user_detail_id = await conn.fetchval(insert_query,
                request.user_id, request.username, request.email, request.fy_id,
                request.name, request.display_name, request.mobile_number, request.pan)
            
        return {"success": True, "user_detail_id": user_detail_id, "message": "User details stored successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))