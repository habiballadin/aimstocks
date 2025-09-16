#!/usr/bin/env python3
import requests
import json
import psycopg2
import psycopg2.extras
import sys
import os
from datetime import datetime

def fetch_symbol_master(exchange_url):
    """Fetch symbol master from Fyers API"""
    try:
        response = requests.get(exchange_url, timeout=30)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching {exchange_url}: {e}")
    return {}

def create_symbol_table():
    """Create symbol master table if not exists"""
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST', 'timescaledb'),
        port=int(os.environ.get('DB_PORT', 5432)),
        user=os.environ.get('DB_USER', 'apiuser'),
        password=os.environ.get('DB_PASSWORD', 'apipass'),
        database=os.environ.get('DB_NAME', 'stockmarket')
    )

    cursor = conn.cursor()

    # Create table if not exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS symbol_master (
            symbol_ticker VARCHAR(50) PRIMARY KEY,
            fy_token VARCHAR(20),
            ex_symbol VARCHAR(100),
            sym_details VARCHAR(200),
            exchange_name VARCHAR(20),
            previous_close DECIMAL(15,2),
            trade_status INT,
            min_lot_size INT,
            tick_size DECIMAL(10,4),
            upper_price DECIMAL(15,2),
            lower_price DECIMAL(15,2),
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

def save_to_postgresql(symbols, exchange_name):
    """Save symbols to PostgreSQL database"""
    if not symbols:
        return 0

    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST', 'timescaledb'),
        port=int(os.environ.get('DB_PORT', 5432)),
        user=os.environ.get('DB_USER', 'apiuser'),
        password=os.environ.get('DB_PASSWORD', 'apipass'),
        database=os.environ.get('DB_NAME', 'stockmarket')
    )

    cursor = conn.cursor()

    count = 0
    for ticker, data in symbols.items():
        try:
            cursor.execute("""
                INSERT INTO symbol_master 
                (symbol_ticker, fy_token, ex_symbol, sym_details, exchange_name,
                 previous_close, trade_status, min_lot_size, tick_size, upper_price, lower_price)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (symbol_ticker) DO UPDATE SET
                fy_token=EXCLUDED.fy_token, sym_details=EXCLUDED.sym_details,
                previous_close=EXCLUDED.previous_close, last_updated=CURRENT_TIMESTAMP
            """, (
                ticker,
                data.get('fyToken'),
                data.get('exSymbol'),
                data.get('symDetails'),
                exchange_name,
                data.get('previousClose'),
                data.get('tradeStatus'),
                data.get('minLotSize'),
                data.get('tickSize'),
                data.get('upperPrice'),
                data.get('lowerPrice')
            ))
            count += 1
        except Exception as e:
            print(f"Error inserting {ticker}: {e}")
    
    conn.commit()
    conn.close()
    return count

def main():
    # Create table first
    print("Creating symbol_master table...")
    create_symbol_table()
    print("✅ Symbol master table ready")

    exchanges = {
        'NSE_CM': 'https://public.fyers.in/sym_details/NSE_CM_sym_master.json',
        'NSE_FO': 'https://public.fyers.in/sym_details/NSE_FO_sym_master.json',
        'BSE_CM': 'https://public.fyers.in/sym_details/BSE_CM_sym_master.json'
    }

    total_symbols = 0

    for exchange, url in exchanges.items():
        print(f"Processing {exchange}...")
        symbols = fetch_symbol_master(url)
        
        if symbols:
            count = save_to_postgresql(symbols, exchange)
            total_symbols += count
            print(f"Saved {count} symbols for {exchange}")
    
    print(f"Total symbols processed: {total_symbols}")
    return total_symbols

if __name__ == "__main__":
    main()