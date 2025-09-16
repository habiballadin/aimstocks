from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from shared.database.connections import db
import asyncio

app = FastAPI(title="Market Data Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuotesRequest(BaseModel):
    symbols: List[str]

@app.on_event("startup")
async def startup():
    await db.init_postgres()
    await db.init_redis()

@app.post("/api/v1/market/quotes")
async def get_quotes(request: QuotesRequest):
    try:
        quotes = {}
        for symbol in request.symbols:
            query = """
                SELECT symbol, ltp, open_price, high_price, low_price, 
                       prev_close, change_value, change_percent, volume
                FROM market_data 
                WHERE symbol = $1 
                ORDER BY time DESC LIMIT 1
            """
            async with db.pg_pool.acquire() as conn:
                row = await conn.fetchrow(query, symbol)
                if row:
                    quotes[symbol] = dict(row)
        return {"quotes": quotes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/market/historical")
async def get_historical_data(symbol: str, resolution: str = "1D", days: int = 30):
    try:
        query = """
            SELECT time, open, high, low, close, volume
            FROM historical_data 
            WHERE symbol = $1 AND timeframe = $2
            AND time >= NOW() - INTERVAL '%s days'
            ORDER BY time ASC
        """ % days
        
        async with db.pg_pool.acquire() as conn:
            rows = await conn.fetch(query, symbol, resolution.lower())
            candles = [dict(row) for row in rows]
        
        return {"symbol": symbol, "candles": candles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/market/status")
async def get_market_status():
    try:
        return {
            "market_status": "OPEN",
            "timestamp": "2024-01-01T09:15:00Z",
            "next_close": "2024-01-01T15:30:00Z"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "market-data-service"}