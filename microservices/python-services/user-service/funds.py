from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database.connections import db
from decimal import Decimal

router = APIRouter()

class FundsRequest(BaseModel):
    user_id: int
    title: str
    equity_amount: float = 0
    commodity_amount: float = 0

@router.post("/funds")
async def store_funds(request: FundsRequest):
    """Store funds data in database"""
    try:
        query = """
            INSERT INTO funds (user_id, title, equity_amount, commodity_amount)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, title) DO UPDATE SET
                equity_amount = EXCLUDED.equity_amount,
                commodity_amount = EXCLUDED.commodity_amount,
                updated_at = NOW()
            RETURNING id
        """
        
        async with db.pg_pool.acquire() as conn:
            fund_id = await conn.fetchval(query,
                request.user_id, request.title,
                Decimal(str(request.equity_amount)),
                Decimal(str(request.commodity_amount)))
            
        return {"success": True, "fund_id": fund_id, "message": "Funds stored successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/funds/{user_id}")
async def get_user_funds(user_id: int):
    """Get user funds"""
    try:
        query = """
            SELECT * FROM funds WHERE user_id = $1 ORDER BY created_at DESC
        """
        
        async with db.pg_pool.acquire() as conn:
            rows = await conn.fetch(query, user_id)
            funds = [dict(row) for row in rows]
            
        return {"success": True, "funds": funds}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))