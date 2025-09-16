from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import psycopg2.extras
import pandas as pd
from typing import List, Dict, Any
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from pydantic import BaseModel
from datetime import datetime
from fyers_service import FyersHistoricalService
from symbol_master import SymbolMasterService
from yahoo_finance_service import YahooFinanceService
from shared.database import db

app = FastAPI(title="Stock Market API", version="1.0.0")
fyers_service = FyersHistoricalService()
symbol_service = SymbolMasterService()
yahoo_service = YahooFinanceService()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 5432)),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        database=os.getenv("DB_NAME", "stockmarket"),
        cursor_factory=psycopg2.extras.RealDictCursor
    )

class UserToken(BaseModel):
    user_id: str
    token: str
    token_type: str = None
    expires_at: datetime = None

class UserDetails(BaseModel):
    user_id: str
    username: str = None
    email: str = None

@app.post("/user-tokens")
async def store_user_token(token: UserToken):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO user_tokens (user_id, token, token_type, expires_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, token_type)
            DO UPDATE SET token=EXCLUDED.token, expires_at=EXCLUDED.expires_at, updated_at=CURRENT_TIMESTAMP
            """
            cursor.execute(sql, (token.user_id, token.token, token.token_type, token.expires_at))
            conn.commit()
        conn.close()
        return {"message": "Token stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-tokens/{user_id}")
async def get_user_tokens(user_id: str):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = "SELECT * FROM user_tokens WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            result = cursor.fetchall()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user-details")
async def store_user_details(details: UserDetails):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO user_details (user_id, username, email)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id)
            DO UPDATE SET username=EXCLUDED.username, email=EXCLUDED.email, updated_at=CURRENT_TIMESTAMP
            """
            cursor.execute(sql, (details.user_id, details.username, details.email))
            conn.commit()
        conn.close()
        return {"message": "User details stored successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user-details/{user_id}")
async def get_user_details(user_id: str):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            sql = "SELECT * FROM user_details WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Stock Market Data API"}

@app.get("/market-summary")
async def get_market_summary():
    try:
        conn = get_db_connection()
        query = "SELECT * FROM market_summary"
        df = pd.read_sql(query, conn)
        conn.close()
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stock/{symbol}")
async def get_stock_data(symbol: str):
    try:
        conn = get_db_connection()
        query = "SELECT * FROM stock_analysis WHERE Symbol = %s ORDER BY Date DESC LIMIT 30"
        df = pd.read_sql(query, conn, params=[symbol])
        conn.close()
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/volatility")
async def get_volatility_analysis():
    try:
        conn = get_db_connection()
        query = "SELECT * FROM volatility_analysis"
        df = pd.read_sql(query, conn)
        conn.close()
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trends")
async def get_market_trends():
    try:
        conn = get_db_connection()
        query = "SELECT * FROM market_trends"
        df = pd.read_sql(query, conn)
        conn.close()
        return df.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fyers/historical/{symbol}")
async def get_fyers_historical(symbol: str, resolution: str = "1D", days: int = 30):
    try:
        data = fyers_service.fetch_historical_data(symbol, resolution, days)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fyers/ingest")
async def ingest_fyers_data(resolution: str = "1D", days: int = 100):
    try:
        result = fyers_service.ingest_all_symbols(resolution, days)
        return {"message": "Data ingestion completed", "records_processed": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ingestion/status")
async def get_ingestion_status():
    try:
        status = fyers_service.get_ingestion_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingestion/realtime/start")
async def start_realtime_ingestion():
    try:
        # Start the real-time ingestion in background
        import asyncio
        from fyers_service import fyers_service_instance

        if not hasattr(fyers_service_instance, "realtime_task") or fyers_service_instance.realtime_task.done():
            loop = asyncio.get_event_loop()
            fyers_service_instance.realtime_task = loop.create_task(fyers_service_instance.start_realtime_ingestion())
            return {"message": "Real-time ingestion started", "status": "running"}
        else:
            return {"message": "Real-time ingestion already running", "status": "running"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingestion/realtime/stop")
async def stop_realtime_ingestion():
    try:
        from fyers_service import fyers_service_instance

        if hasattr(fyers_service_instance, "realtime_task") and not fyers_service_instance.realtime_task.done():
            fyers_service_instance.realtime_task.cancel()
            return {"message": "Real-time ingestion stopped", "status": "stopped"}
        else:
            return {"message": "Real-time ingestion not running", "status": "stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ingestion/data-sources")
async def get_data_sources_status():
    try:
        # Get status of different data sources
        sources = [
            {
                "name": "Fyers API",
                "status": "connected" if fyers_service.check_fyers_connection() else "disconnected",
                "lastUpdate": fyers_service.get_last_update_time(),
                "symbolsCount": fyers_service.get_symbols_count(),
                "latency": fyers_service.get_average_latency()
            },
            {
                "name": "Yahoo Finance",
                "status": "connected",  # Assume always available
                "lastUpdate": "2 min ago",
                "symbolsCount": 5,
                "latency": 1200
            },
            {
                "name": "NSE API",
                "status": "connected",  # Assume always available
                "lastUpdate": "1 min ago",
                "symbolsCount": 5,
                "latency": 800
            }
        ]
        return sources
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/fyers/latest")
async def get_fyers_latest():
    try:
        return fyers_service.get_latest_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/symbols/update")
async def update_symbols():
    try:
        symbol_service.update_all_symbols()
        return {"message": "Symbol master updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/symbols/search")
async def search_symbols(q: str, exchange: str = None, limit: int = 50):
    try:
        return symbol_service.search_symbols(q, exchange, limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/symbols/popular")
async def get_popular_symbols():
    try:
        return symbol_service.get_popular_stocks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/symbols/validate/{symbol}")
async def validate_symbol(symbol: str):
    try:
        conn = get_db_connection()
        query = "SELECT * FROM symbol_master WHERE ex_symbol = %s OR symbol_ticker = %s"
        cursor = conn.cursor()
        cursor.execute(query, (symbol, symbol))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "valid": True,
                "symbol": result,
                "tradeable": result['trade_status'] == 1,
                "limits": {
                    "upper_price": result['upper_price'],
                    "lower_price": result['lower_price'],
                    "min_lot_size": result['min_lot_size'],
                    "tick_size": result['tick_size']
                }
            }
        return {"valid": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/symbols/by-exchange/{exchange}")
async def get_symbols_by_exchange(exchange: str, limit: int = 100):
    try:
        conn = get_db_connection()
        query = "SELECT * FROM symbol_master WHERE exchange_name = %s LIMIT %s"
        cursor = conn.cursor()
        cursor.execute(query, (exchange, limit))
        result = cursor.fetchall()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===========================================
# YAHOO FINANCE ENDPOINTS
# ===========================================

@app.get("/yahoo/historical/{symbol}")
async def get_yahoo_historical(symbol: str, period: str = "1y", interval: str = "1d"):
    """Get historical data from Yahoo Finance"""
    try:
        data = yahoo_service.fetch_historical_data(symbol, period, interval)
        if data.empty:
            raise HTTPException(status_code=404, detail="No data found for symbol")
        return data.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/yahoo/ingest")
async def ingest_yahoo_data(symbols: List[str] = None, period: str = "2y",
                           interval: str = "1d", include_extended: bool = True,
                           include_ai_data: bool = True):
    """Ingest data from Yahoo Finance for specified symbols"""
    try:
        result = yahoo_service.ingest_all_symbols(symbols, period, interval, include_extended, include_ai_data)
        return {
            "message": "Yahoo Finance data ingestion completed with comprehensive AI data",
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/yahoo/ingest/{symbol}")
async def ingest_single_symbol(symbol: str, period: str = "2y",
                              interval: str = "1d", include_extended: bool = True,
                              include_ai_data: bool = True):
    """Ingest data from Yahoo Finance for a single symbol"""
    try:
        result = yahoo_service.ingest_symbol_data(symbol, period, interval, include_extended, include_ai_data)
        return {
            "message": f"Data ingestion completed for {symbol} with comprehensive AI data",
            "results": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/yahoo/ingest/ai-analysis")
async def ingest_ai_analysis_data(symbols: List[str] = None, period: str = "5y",
                                 interval: str = "1d"):
    """Ingest comprehensive data for AI analysis purposes"""
    try:
        result = yahoo_service.ingest_all_symbols(symbols, period, interval,
                                                 include_extended=True, include_ai_data=True)
        return {
            "message": "Comprehensive AI analysis data ingestion completed",
            "results": result,
            "data_types_ingested": [
                "historical_data", "dividends", "stock_splits", "company_info",
                "earnings", "news", "financial_statements", "options_data",
                "analyst_recommendations", "institutional_holders", "insider_transactions"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/yahoo/ingest/{symbol}/ai-analysis")
async def ingest_single_symbol_ai_analysis(symbol: str, period: str = "5y",
                                          interval: str = "1d"):
    """Ingest comprehensive data for AI analysis for a single symbol"""
    try:
        result = yahoo_service.ingest_symbol_data(symbol, period, interval,
                                                include_extended=True, include_ai_data=True)
        return {
            "message": f"Comprehensive AI analysis data ingestion completed for {symbol}",
            "results": result,
            "data_types_ingested": [
                "historical_data", "dividends", "stock_splits", "company_info",
                "earnings", "news", "financial_statements", "options_data",
                "analyst_recommendations", "institutional_holders", "insider_transactions"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/company/{symbol}")
async def get_yahoo_company_info(symbol: str):
    """Get company information from Yahoo Finance"""
    try:
        info = yahoo_service.fetch_company_info(symbol)
        if not info:
            raise HTTPException(status_code=404, detail="Company info not found")
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/dividends/{symbol}")
async def get_yahoo_dividends(symbol: str):
    """Get dividend history from Yahoo Finance"""
    try:
        dividends = yahoo_service.fetch_dividends(symbol)
        if dividends.empty:
            return []
        return dividends.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/splits/{symbol}")
async def get_yahoo_splits(symbol: str):
    """Get stock split history from Yahoo Finance"""
    try:
        splits = yahoo_service.fetch_splits(symbol)
        if splits.empty:
            return []
        return splits.to_dict('records')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/earnings/{symbol}")
async def get_yahoo_earnings(symbol: str):
    """Get earnings data from Yahoo Finance"""
    try:
        earnings = yahoo_service.fetch_earnings(symbol)
        return earnings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/news/{symbol}")
async def get_yahoo_news(symbol: str):
    """Get news articles from Yahoo Finance"""
    try:
        news = yahoo_service.fetch_news(symbol)
        return news
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/status")
async def get_yahoo_ingestion_status():
    """Get Yahoo Finance ingestion status"""
    try:
        status = yahoo_service.get_ingestion_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/latest")
async def get_yahoo_latest(symbol: str = None, limit: int = 30):
    """Get latest Yahoo Finance data"""
    try:
        data = yahoo_service.get_latest_data(symbol, limit)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/performance/{symbol}")
async def get_yahoo_performance(symbol: str, days: int = 30):
    """Get stock performance data"""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM yahoo_get_stock_performance(%s, '1d', %s)
            """, (symbol, days))
            result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/dividend-info/{symbol}")
async def get_yahoo_dividend_info(symbol: str):
    """Get dividend information and yield"""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM yahoo_get_dividend_info(%s)
            """, (symbol,))
            result = cursor.fetchone()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/upcoming-dividends")
async def get_upcoming_dividends():
    """Get upcoming dividend payments"""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM yahoo_upcoming_dividends
                ORDER BY ex_dividend_date
                LIMIT 20
            """)
            result = cursor.fetchall()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yahoo/earnings-calendar")
async def get_earnings_calendar():
    """Get upcoming earnings dates"""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute("""
                SELECT * FROM yahoo_earnings_calendar
                ORDER BY earnings_date
                LIMIT 20
            """)
            result = cursor.fetchall()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
