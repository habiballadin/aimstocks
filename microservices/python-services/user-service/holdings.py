from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database.connections import db
from decimal import Decimal

router = APIRouter()

class HoldingsRequest(BaseModel):
    portfolio_id: int
    symbol: str
    exchange: str = "NSE"
    quantity: int = 0
    avg_cost: float = 0
    current_price: float = 0
    market_value: float = 0
    pnl: float = 0
    pnl_percent: float = 0

@router.post("/holdings")
async def store_holdings(request: HoldingsRequest):
    """Store holdings data in database"""
    try:
        query = """
            INSERT INTO holdings (portfolio_id, symbol, exchange, quantity, avg_cost, current_price, market_value, pnl, pnl_percent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (portfolio_id, symbol, exchange) DO UPDATE SET
                quantity = EXCLUDED.quantity,
                avg_cost = EXCLUDED.avg_cost,
                current_price = EXCLUDED.current_price,
                market_value = EXCLUDED.market_value,
                pnl = EXCLUDED.pnl,
                pnl_percent = EXCLUDED.pnl_percent,
                updated_at = NOW()
            RETURNING id
        """
        
        async with db.pg_pool.acquire() as conn:
            holding_id = await conn.fetchval(query,
                request.portfolio_id, request.symbol, request.exchange,
                request.quantity, Decimal(str(request.avg_cost)),
                Decimal(str(request.current_price)), Decimal(str(request.market_value)),
                Decimal(str(request.pnl)), Decimal(str(request.pnl_percent)))
            
        return {"success": True, "holding_id": holding_id, "message": "Holdings stored successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/holdings/{portfolio_id}")
async def get_holdings(portfolio_id: int):
    """Get holdings for a portfolio"""
    try:
        query = """
            SELECT * FROM holdings WHERE portfolio_id = $1 ORDER BY updated_at DESC
        """
        
        async with db.pg_pool.acquire() as conn:
            rows = await conn.fetch(query, portfolio_id)
            holdings = [dict(row) for row in rows]
            
        return {"success": True, "holdings": holdings}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))