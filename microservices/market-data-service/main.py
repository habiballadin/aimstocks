from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.database import db
from shared.models import MarketData, APIResponse
import yfinance as yf
import pandas as pd
import httpx
import asyncio
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Market Data Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BROKER_SERVICE_URL = os.getenv("BROKER_SERVICE_URL", "http://localhost:8002")

async def get_market_data_from_broker(symbol: str, period: str = "1d"):
    """Get market data from broker service (Fyers)"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{BROKER_SERVICE_URL}/api/fyers/historical/{symbol}",
                params={"resolution": "D"},
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get("success") and result.get("data", {}).get("candles"):
                    candles = result["data"]["candles"]
                    df = pd.DataFrame(candles, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
                    df.set_index('timestamp', inplace=True)
                    return df
    except Exception as e:
        logger.error(f"Error getting data from broker: {str(e)}")
    
    return None

async def get_market_data_from_yfinance(symbol: str, period: str = "1d"):
    """Fallback to yfinance for market data"""
    try:
        # Add .NS suffix for Indian stocks if not present
        if '.' not in symbol:
            symbol = f"{symbol}.NS"
        
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=period)
        
        if data.empty:
            return None
            
        # Convert to lowercase column names
        data.columns = data.columns.str.lower()
        return data
    except Exception as e:
        logger.error(f"Error getting data from yfinance: {str(e)}")
        return None

@app.get("/api/market-data/{symbol}")
async def get_market_data(symbol: str, period: str = "1d", interval: str = "1m"):
    try:
        # Try broker service first, then fallback to yfinance
        data = await get_market_data_from_broker(symbol, period)
        if data is None:
            data = await get_market_data_from_yfinance(symbol, period)
        
        if data is None:
            raise HTTPException(status_code=404, detail="No data found for symbol")
        
        # Convert to list of dictionaries
        data_list = []
        for index, row in data.iterrows():
            data_list.append({
                'timestamp': index.isoformat(),
                'open': float(row['open']),
                'high': float(row['high']),
                'low': float(row['low']),
                'close': float(row['close']),
                'volume': int(row['volume'])
            })
        
        # Update market data cache
        if data_list:
            latest = data_list[-1]
            await update_market_data_cache(symbol, latest)
        
        return APIResponse(success=True, data={"data": data_list})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting market data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def update_market_data_cache(symbol: str, latest_data: dict):
    """Update market data cache in database"""
    try:
        # Calculate change values
        prev_close = latest_data.get('open', latest_data['close'])  # Simplified
        change_value = latest_data['close'] - prev_close
        change_percent = (change_value / prev_close) * 100 if prev_close > 0 else 0
        
        # Update or insert market data
        db.execute_query(
            """INSERT INTO market_data (symbol, exchange, ltp, open_price, high_price, low_price, 
                                      prev_close, volume, change_value, change_percent) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
               ON DUPLICATE KEY UPDATE
               ltp = VALUES(ltp), open_price = VALUES(open_price), high_price = VALUES(high_price),
               low_price = VALUES(low_price), volume = VALUES(volume), 
               change_value = VALUES(change_value), change_percent = VALUES(change_percent)""",
            (symbol.replace('.NS', ''), 'NSE', latest_data['close'], latest_data['open'],
             latest_data['high'], latest_data['low'], prev_close, latest_data['volume'],
             change_value, change_percent)
        )
    except Exception as e:
        logger.error(f"Error updating market data cache: {str(e)}")

@app.get("/api/market-data/quotes/{symbols}")
async def get_quotes(symbols: str):
    try:
        symbol_list = symbols.split(',')
        
        # Try to get from broker service first
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{BROKER_SERVICE_URL}/api/fyers/quotes",
                    params={"symbols": symbols},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("success"):
                        return APIResponse(success=True, data=result.get("data"))
        except Exception as e:
            logger.error(f"Error getting quotes from broker: {str(e)}")
        
        # Fallback to database cache
        quotes = []
        for symbol in symbol_list:
            quote_data = db.execute_query(
                "SELECT * FROM market_data WHERE symbol = %s",
                (symbol.replace('.NS', ''),)
            )
            
            if quote_data:
                quotes.append(quote_data[0])
        
        return APIResponse(success=True, data={"quotes": quotes})
        
    except Exception as e:
        logger.error(f"Error getting quotes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market-data/watchlist/{user_id}")
async def get_watchlist_data(user_id: int):
    try:
        # Get user's watchlist
        watchlist = db.execute_query(
            """SELECT w.symbol, w.exchange, m.ltp, m.change_value, m.change_percent, 
                      m.volume, m.high_price, m.low_price
               FROM watchlist w
               LEFT JOIN market_data m ON w.symbol = m.symbol AND w.exchange = m.exchange
               WHERE w.user_id = %s
               ORDER BY w.sort_order, w.created_at""",
            (user_id,)
        )
        
        return APIResponse(success=True, data={"watchlist": watchlist})
        
    except Exception as e:
        logger.error(f"Error getting watchlist data: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get watchlist data")

@app.post("/api/market-data/watchlist")
async def add_to_watchlist(watchlist_data: dict):
    try:
        user_id = watchlist_data.get("user_id")
        symbol = watchlist_data.get("symbol")
        exchange = watchlist_data.get("exchange", "NSE")
        
        if not user_id or not symbol:
            raise HTTPException(status_code=400, detail="User ID and symbol required")
        
        # Check if already in watchlist
        existing = db.execute_query(
            "SELECT id FROM watchlist WHERE user_id = %s AND symbol = %s AND exchange = %s",
            (user_id, symbol, exchange)
        )
        
        if existing:
            raise HTTPException(status_code=400, detail="Symbol already in watchlist")
        
        # Add to watchlist
        db.execute_query(
            "INSERT INTO watchlist (user_id, symbol, exchange) VALUES (%s, %s, %s)",
            (user_id, symbol, exchange)
        )
        
        return APIResponse(success=True, message="Symbol added to watchlist")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding to watchlist: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add to watchlist")

@app.delete("/api/market-data/watchlist/{watchlist_id}")
async def remove_from_watchlist(watchlist_id: int):
    try:
        result = db.execute_query(
            "DELETE FROM watchlist WHERE id = %s",
            (watchlist_id,)
        )
        
        if result == 0:
            raise HTTPException(status_code=404, detail="Watchlist item not found")
        
        return APIResponse(success=True, message="Symbol removed from watchlist")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing from watchlist: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove from watchlist")

@app.get("/api/market-data/market-overview")
async def get_market_overview():
    try:
        # Get major indices
        indices = ["NIFTY50", "BANKNIFTY", "SENSEX"]
        overview_data = []
        
        for index in indices:
            data = db.execute_query(
                "SELECT * FROM market_data WHERE symbol = %s",
                (index,)
            )
            
            if data:
                overview_data.append(data[0])
        
        # Get top gainers and losers
        top_gainers = db.execute_query(
            """SELECT symbol, ltp, change_percent 
               FROM market_data 
               WHERE change_percent > 0 
               ORDER BY change_percent DESC 
               LIMIT 5"""
        )
        
        top_losers = db.execute_query(
            """SELECT symbol, ltp, change_percent 
               FROM market_data 
               WHERE change_percent < 0 
               ORDER BY change_percent ASC 
               LIMIT 5"""
        )
        
        return APIResponse(success=True, data={
            "indices": overview_data,
            "topGainers": top_gainers,
            "topLosers": top_losers
        })
        
    except Exception as e:
        logger.error(f"Error getting market overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get market overview")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "market-data-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)