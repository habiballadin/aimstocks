#!/usr/bin/env python3
import requests
import json
import psycopg2
import pandas as pd
from datetime import datetime, timedelta
import time
import os

def get_access_token():
    """Get access token from database"""
    try:
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST', 'timescaledb'),
            port=int(os.environ.get('DB_PORT', 5432)),
            user=os.environ.get('DB_USER', 'apiuser'),
            password=os.environ.get('DB_PASSWORD', 'apipass'),
            database=os.environ.get('DB_NAME', 'stockmarket')
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT token FROM user_tokens
            WHERE token_type = 'fyers_access_token'
            ORDER BY created_at DESC
            LIMIT 1
        """)
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else None
    except Exception as e:
        print(f"Error getting access token: {e}")
        return None

def get_symbols_from_db():
    """Get active symbols from database"""
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST', 'timescaledb'),
        port=int(os.environ.get('DB_PORT', 5432)),
        user=os.environ.get('DB_USER', 'apiuser'),
        password=os.environ.get('DB_PASSWORD', 'apipass'),
        database=os.environ.get('DB_NAME', 'stockmarket')
    )
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ex_symbol FROM symbol_master
        WHERE exchange_name = 'NSE_CM'
        AND trade_status = 1
        LIMIT 50
    """)

    symbols = [row[0] for row in cursor.fetchall()]
    conn.close()
    return symbols

def fetch_historical_data(symbol):
    """Fetch historical data from Fyers API"""
    end_date = datetime.now() - timedelta(minutes=1)
    start_date = end_date - timedelta(days=1)

    # Format symbol as NSE:SYMBOL-EQ
    if not symbol.endswith('-EQ'):
        symbol = f"NSE:{symbol}-EQ"

    params = {
        "symbol": symbol,
        "resolution": "1D",
        "date_format": "1",
        "range_from": start_date.strftime("%Y-%m-%d"),
        "range_to": end_date.strftime("%Y-%m-%d"),
        "cont_flag": ""
    }

    access_token = get_access_token()
    if not access_token:
        print(f"No access token available for {symbol}")
        return []

    app_id = os.environ.get('FYERS_CLIENT_ID', 'your_app_id')
    headers = {
        "Authorization": f"{app_id}:{access_token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(
            "https://api-t1.fyers.in/data/history",
            params=params,
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            if data.get("s") == "ok":
                return data.get("candles", [])
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")

    return []

def save_historical_data(symbol, candles):
    """Save historical data to PostgreSQL"""
    if not candles:
        return 0

    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST', 'timescaledb'),
        port=int(os.environ.get('DB_PORT', 5432)),
        user=os.environ.get('DB_USER', 'apiuser'),
        password=os.environ.get('DB_PASSWORD', 'apipass'),
        database=os.environ.get('DB_NAME', 'stockmarket')
    )
    
    cursor = conn.cursor()
    
    # Use existing fyers_historical_data table
    
    count = 0
    for candle in candles:
        if len(candle) >= 6:
            try:
                cursor.execute("""
                    INSERT INTO fyers_historical_data
                    (symbol, timestamp, date, open, high, low, close, volume)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (symbol, timestamp) DO UPDATE SET
                    open=EXCLUDED.open, high=EXCLUDED.high, low=EXCLUDED.low,
                    close=EXCLUDED.close, volume=EXCLUDED.volume
                """, (
                    symbol,
                    candle[0],
                    datetime.fromtimestamp(candle[0]).date(),
                    candle[1],
                    candle[2],
                    candle[3],
                    candle[4],
                    candle[5]
                ))
                count += 1
            except Exception as e:
                print(f"Error inserting candle for {symbol}: {e}")
    
    conn.commit()
    conn.close()
    return count

def main():
    symbols = get_symbols_from_db()
    total_records = 0
    
    for symbol in symbols:
        print(f"Processing {symbol}...")
        candles = fetch_historical_data(symbol)
        
        if candles:
            count = save_historical_data(symbol, candles)
            total_records += count
            print(f"Saved {count} records for {symbol}")
        
        time.sleep(0.5)  # Rate limiting
    
    print(f"Total records processed: {total_records}")
    return total_records

if __name__ == "__main__":
    main()