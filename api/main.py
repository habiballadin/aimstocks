from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pymysql
import pandas as pd
from typing import List, Dict, Any
import os

app = FastAPI(title="Stock Market API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return pymysql.connect(
        host=os.getenv("MYSQL_HOST", "mysql-db"),
        port=int(os.getenv("MYSQL_PORT", 3306)),
        user=os.getenv("MYSQL_USER", "spark"),
        password=os.getenv("MYSQL_PASSWORD", "sparkpass"),
        database=os.getenv("MYSQL_DATABASE", "stockmarket"),
        cursorclass=pymysql.cursors.DictCursor
    )

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

@app.get("/health")
async def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}