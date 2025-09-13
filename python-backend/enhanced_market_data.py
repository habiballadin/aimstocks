import yfinance as yf
import asyncio
import aiohttp
from datetime import datetime, timedelta
import logging
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional
import json

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedMarketData:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'database': os.getenv('DB_NAME', 'aimstocks'),
            'user': os.getenv('DB_USER', 'aimstocks_user'),
            'password': os.getenv('DB_PASSWORD', 'aimstocks_password')
        }
        
        # Indian market symbols
        self.indian_symbols = {
            'RELIANCE.NS': 'RELIANCE',
            'TCS.NS': 'TCS', 
            'INFY.NS': 'INFY',
            'HDFCBANK.NS': 'HDFCBANK',
            'ICICIBANK.NS': 'ICICIBANK',
            'HINDUNILVR.NS': 'HINDUNILVR',
            'ITC.NS': 'ITC',
            'SBIN.NS': 'SBIN',
            'BHARTIARTL.NS': 'BHARTIARTL',
            'KOTAKBANK.NS': 'KOTAKBANK',
            '^NSEI': 'NIFTY50',
            '^NSEBANK': 'BANKNIFTY'
        }

    def get_single_ticker_data(self, symbol: str) -> Dict:
        """Get data for single ticker using yfinance Ticker class"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Get current data
            hist = ticker.history(period="2d", interval="1m")
            if hist.empty:
                return {}
                
            current = hist.iloc[-1]
            prev_close = hist.iloc[-2]['Close'] if len(hist) > 1 else current['Close']
            
            # Get additional info
            info = ticker.info
            
            return {
                'symbol': self.indian_symbols.get(symbol, symbol),
                'ltp': float(current['Close']),
                'open': float(current['Open']),
                'high': float(current['High']),
                'low': float(current['Low']),
                'volume': int(current['Volume']),
                'change': float(current['Close'] - prev_close),
                'change_percent': float((current['Close'] - prev_close) / prev_close * 100),
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'dividend_yield': info.get('dividendYield', 0)
            }
        except Exception as e:
            logger.error(f"Error fetching {symbol}: {e}")
            return {}

    def get_multiple_tickers_data(self, symbols: List[str]) -> Dict:
        """Get data for multiple tickers using yfinance Tickers class"""
        try:
            tickers = yf.Tickers(' '.join(symbols))
            data = {}
            
            for symbol in symbols:
                try:
                    ticker = tickers.tickers[symbol]
                    hist = ticker.history(period="2d", interval="1m")
                    
                    if not hist.empty:
                        current = hist.iloc[-1]
                        prev_close = hist.iloc[-2]['Close'] if len(hist) > 1 else current['Close']
                        
                        data[self.indian_symbols.get(symbol, symbol)] = {
                            'ltp': float(current['Close']),
                            'open': float(current['Open']),
                            'high': float(current['High']),
                            'low': float(current['Low']),
                            'volume': int(current['Volume']),
                            'change': float(current['Close'] - prev_close),
                            'change_percent': float((current['Close'] - prev_close) / prev_close * 100)
                        }
                except Exception as e:
                    logger.error(f"Error processing {symbol}: {e}")
                    continue
                    
            return data
        except Exception as e:
            logger.error(f"Error fetching multiple tickers: {e}")
            return {}

    def download_historical_data(self, symbols: List[str], period: str = "1mo") -> Dict:
        """Download historical data using yfinance download function"""
        try:
            data = yf.download(symbols, period=period, group_by='ticker', auto_adjust=True, prepost=True)
            
            if data.empty:
                return {}
                
            result = {}
            for symbol in symbols:
                try:
                    if len(symbols) == 1:
                        symbol_data = data
                    else:
                        symbol_data = data[symbol]
                    
                    if not symbol_data.empty:
                        latest = symbol_data.iloc[-1]
                        prev = symbol_data.iloc[-2] if len(symbol_data) > 1 else latest
                        
                        result[self.indian_symbols.get(symbol, symbol)] = {
                            'ltp': float(latest['Close']),
                            'open': float(latest['Open']),
                            'high': float(latest['High']),
                            'low': float(latest['Low']),
                            'volume': int(latest['Volume']),
                            'change': float(latest['Close'] - prev['Close']),
                            'change_percent': float((latest['Close'] - prev['Close']) / prev['Close'] * 100)
                        }
                except Exception as e:
                    logger.error(f"Error processing downloaded data for {symbol}: {e}")
                    continue
                    
            return result
        except Exception as e:
            logger.error(f"Error downloading data: {e}")
            return {}

    async def get_live_streaming_data(self, symbols: List[str]) -> Dict:
        """Get live streaming data using yfinance WebSocket (if available)"""
        try:
            # Note: yfinance WebSocket may not be available in all versions
            # Fallback to regular API calls
            return self.get_multiple_tickers_data(symbols)
        except Exception as e:
            logger.error(f"WebSocket streaming error: {e}")
            return self.get_multiple_tickers_data(symbols)

    def search_symbols(self, query: str) -> List[Dict]:
        """Search for symbols using yfinance Search"""
        try:
            search = yf.Search(query, max_results=10)
            results = []
            
            for result in search.results:
                results.append({
                    'symbol': result.get('symbol', ''),
                    'name': result.get('longname', result.get('shortname', '')),
                    'exchange': result.get('exchange', ''),
                    'type': result.get('quoteType', '')
                })
            
            return results
        except Exception as e:
            logger.error(f"Search error: {e}")
            return []

    def get_market_summary(self) -> Dict:
        """Get market summary using yfinance Market class"""
        try:
            market = yf.Market()
            summary = market.summary()
            
            return {
                'market_state': summary.get('marketState', 'UNKNOWN'),
                'indices': summary.get('indices', []),
                'currencies': summary.get('currencies', []),
                'commodities': summary.get('commodities', [])
            }
        except Exception as e:
            logger.error(f"Market summary error: {e}")
            return {}

    def get_db_connection(self):
        """Get database connection"""
        try:
            return mysql.connector.connect(**self.db_config)
        except Error as e:
            logger.error(f"Database connection error: {e}")
            return None

    async def update_market_data_db(self, data: Dict):
        """Update market data in database"""
        connection = self.get_db_connection()
        if not connection:
            return
            
        try:
            cursor = connection.cursor()
            
            for symbol, info in data.items():
                if not info or not info.get('ltp'):
                    continue
                    
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
                    symbol, 'NSE',
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

    async def fetch_all_data_sources(self):
        """Fetch data using all yfinance methods"""
        symbols = list(self.indian_symbols.keys())
        
        logger.info("Fetching data using yfinance download method...")
        download_data = self.download_historical_data(symbols)
        
        logger.info("Fetching data using Tickers class...")
        tickers_data = self.get_multiple_tickers_data(symbols)
        
        logger.info("Getting market summary...")
        market_summary = self.get_market_summary()
        
        # Merge data with priority: download > tickers
        merged_data = {**tickers_data, **download_data}
        
        if merged_data:
            await self.update_market_data_db(merged_data)
            logger.info(f"Successfully updated {len(merged_data)} symbols")
        else:
            logger.warning("No data received from yfinance")
        
        return {
            'market_data': merged_data,
            'market_summary': market_summary
        }

    async def run_continuous_updates(self, interval: int = 30):
        """Run continuous market data updates"""
        logger.info(f"Starting continuous updates (interval: {interval}s)")
        
        while True:
            try:
                await self.fetch_all_data_sources()
                await asyncio.sleep(interval)
            except Exception as e:
                logger.error(f"Error in continuous updates: {e}")
                await asyncio.sleep(interval)

async def main():
    """Main function"""
    market_data = EnhancedMarketData()
    
    # Test single ticker
    logger.info("Testing single ticker...")
    single_data = market_data.get_single_ticker_data('RELIANCE.NS')
    logger.info(f"Single ticker data: {single_data}")
    
    # Test search
    logger.info("Testing search...")
    search_results = market_data.search_symbols('Reliance')
    logger.info(f"Search results: {search_results}")
    
    # Fetch all data
    await market_data.fetch_all_data_sources()

if __name__ == "__main__":
    asyncio.run(main())