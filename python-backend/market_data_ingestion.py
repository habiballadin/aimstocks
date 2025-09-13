import asyncio
import aiohttp
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional
import json
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from fyers_client import fyers_client

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketDataIngestion:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'database': os.getenv('DB_NAME', 'aimstocks'),
            'user': os.getenv('DB_USER', 'aimstocks_user'),
            'password': os.getenv('DB_PASSWORD', 'aimstocks_password')
        }
        self.symbols = ['NIFTY50', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK']
        
    async def get_fyers_data(self, symbols: List[str]) -> Dict:
        """Get real-time data from Fyers API"""
        try:
            if not fyers_client.fyers:
                logger.warning("Fyers not authenticated")
                return {}
                
            fyers_symbols = [f"NSE:{symbol}-EQ" if symbol not in ['NIFTY50', 'BANKNIFTY'] 
                           else f"NSE:{symbol}-INDEX" for symbol in symbols]
            
            result = fyers_client.get_quotes(fyers_symbols)
            if result['success']:
                return result['data'].get('d', {})
            return {}
        except Exception as e:
            logger.error(f"Fyers API error: {e}")
            return {}
    
    async def get_yahoo_data(self, symbols: List[str]) -> Dict:
        """Get data from Yahoo Finance"""
        try:
            yahoo_symbols = [f"{symbol}.NS" if symbol not in ['NIFTY50', 'BANKNIFTY'] 
                           else f"^NSEI" if symbol == 'NIFTY50' else f"^NSEBANK" 
                           for symbol in symbols]
            
            data = {}
            for i, symbol in enumerate(symbols):
                try:
                    ticker = yf.Ticker(yahoo_symbols[i])
                    info = ticker.history(period="1d", interval="1m").tail(1)
                    if not info.empty:
                        current = info.iloc[-1]
                        prev_close = ticker.info.get('previousClose', current['Close'])
                        change = current['Close'] - prev_close
                        change_percent = (change / prev_close) * 100 if prev_close else 0
                        
                        data[symbol] = {
                            'ltp': current['Close'],
                            'open': current['Open'],
                            'high': current['High'],
                            'low': current['Low'],
                            'volume': current['Volume'],
                            'change': change,
                            'change_percent': change_percent
                        }
                except Exception as e:
                    logger.error(f"Yahoo Finance error for {symbol}: {e}")
                    continue
            return data
        except Exception as e:
            logger.error(f"Yahoo Finance API error: {e}")
            return {}
    
    async def get_nse_data(self, symbols: List[str]) -> Dict:
        """Get data from NSE API (unofficial)"""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
                
                data = {}
                for symbol in symbols:
                    try:
                        if symbol in ['NIFTY50', 'BANKNIFTY']:
                            url = f"https://www.nseindia.com/api/equity-stockIndices?index={symbol}"
                        else:
                            url = f"https://www.nseindia.com/api/quote-equity?symbol={symbol}"
                        
                        async with session.get(url, headers=headers) as response:
                            if response.status == 200:
                                result = await response.json()
                                if symbol in ['NIFTY50', 'BANKNIFTY']:
                                    for item in result.get('data', []):
                                        if item.get('index') == symbol:
                                            data[symbol] = {
                                                'ltp': item.get('last'),
                                                'open': item.get('open'),
                                                'high': item.get('dayHigh'),
                                                'low': item.get('dayLow'),
                                                'change': item.get('change'),
                                                'change_percent': item.get('pChange')
                                            }
                                            break
                                else:
                                    info = result.get('data', [{}])[0] if result.get('data') else {}
                                    data[symbol] = {
                                        'ltp': info.get('lastPrice'),
                                        'open': info.get('open'),
                                        'high': info.get('dayHigh'),
                                        'low': info.get('dayLow'),
                                        'volume': info.get('totalTradedVolume'),
                                        'change': info.get('change'),
                                        'change_percent': info.get('pChange')
                                    }
                    except Exception as e:
                        logger.error(f"NSE API error for {symbol}: {e}")
                        continue
                        
                return data
        except Exception as e:
            logger.error(f"NSE API error: {e}")
            return {}
    
    def get_db_connection(self):
        """Get database connection"""
        try:
            connection = mysql.connector.connect(**self.db_config)
            return connection
        except Error as e:
            logger.error(f"Database connection error: {e}")
            return None
    
    async def update_market_data(self, data: Dict):
        """Update market data in database"""
        connection = self.get_db_connection()
        if not connection:
            return
            
        try:
            cursor = connection.cursor()
            
            for symbol, info in data.items():
                if not info or not info.get('ltp'):
                    continue
                    
                exchange = 'NSE'
                query = """
                INSERT INTO market_data (symbol, exchange, ltp, open_price, high_price, low_price, 
                                       volume, change_value, change_percent, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE
                ltp = VALUES(ltp),
                open_price = VALUES(open_price),
                high_price = VALUES(high_price),
                low_price = VALUES(low_price),
                volume = VALUES(volume),
                change_value = VALUES(change_value),
                change_percent = VALUES(change_percent),
                updated_at = NOW()
                """
                
                values = (
                    symbol, exchange,
                    float(info.get('ltp', 0)),
                    float(info.get('open', 0)),
                    float(info.get('high', 0)),
                    float(info.get('low', 0)),
                    int(info.get('volume', 0)),
                    float(info.get('change', 0)),
                    float(info.get('change_percent', 0))
                )
                
                cursor.execute(query, values)
            
            connection.commit()
            logger.info(f"Updated {len(data)} symbols in database")
            
        except Error as e:
            logger.error(f"Database update error: {e}")
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    
    async def fetch_and_update_data(self):
        """Fetch data from multiple sources and update database"""
        logger.info("Fetching market data from multiple sources...")
        
        # Try Fyers first (most reliable for Indian markets)
        fyers_data = await self.get_fyers_data(self.symbols)
        
        # Fallback to Yahoo Finance
        yahoo_data = await self.get_yahoo_data(self.symbols)
        
        # Fallback to NSE (may be rate limited)
        nse_data = await self.get_nse_data(self.symbols)
        
        # Merge data with priority: Fyers > Yahoo > NSE
        merged_data = {}
        for symbol in self.symbols:
            if symbol in fyers_data and fyers_data[symbol]:
                merged_data[symbol] = fyers_data[symbol]
            elif symbol in yahoo_data and yahoo_data[symbol]:
                merged_data[symbol] = yahoo_data[symbol]
            elif symbol in nse_data and nse_data[symbol]:
                merged_data[symbol] = nse_data[symbol]
        
        if merged_data:
            await self.update_market_data(merged_data)
            logger.info(f"Successfully updated data for {len(merged_data)} symbols")
        else:
            logger.warning("No market data received from any source")
    
    async def run_continuous_ingestion(self, interval: int = 5):
        """Run continuous market data ingestion"""
        logger.info(f"Starting continuous market data ingestion (interval: {interval}s)")
        
        while True:
            try:
                # Check if market is open (9:15 AM to 3:30 PM IST)
                now = datetime.now()
                market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
                market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
                
                if market_open <= now <= market_close and now.weekday() < 5:
                    await self.fetch_and_update_data()
                else:
                    logger.info("Market closed - skipping data fetch")
                
                await asyncio.sleep(interval)
                
            except Exception as e:
                logger.error(f"Error in continuous ingestion: {e}")
                await asyncio.sleep(interval)

async def main():
    """Main function to run market data ingestion"""
    ingestion = MarketDataIngestion()
    
    # Run one-time fetch
    await ingestion.fetch_and_update_data()
    
    # Uncomment to run continuous ingestion
    # await ingestion.run_continuous_ingestion(interval=5)

if __name__ == "__main__":
    asyncio.run(main())