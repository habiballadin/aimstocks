import requests
import asyncio
from datetime import datetime, timedelta
from shared.database.connections import db
from shared.events.kafka_manager import EventPublisher

class FyersClient:
    def __init__(self, user_id=None, access_token=None):
        self.user_id = user_id
        self.access_token = access_token
        self.base_url = "https://api-t1.fyers.in/api/v3"
        self.headers = None
    
    async def init_client(self):
        if not self.access_token and self.user_id:
            self.access_token = await self.get_access_token(self.user_id)
        if self.access_token:
            self.headers = {"Authorization": f"Bearer {self.access_token}"}
    
    @staticmethod
    async def get_access_token(user_id):
        query = "SELECT token_hash FROM user_tokens WHERE user_id = $1 AND token_type = 'fyers_access' AND expires_at > NOW() AND is_revoked = false"
        async with db.pg_pool.acquire() as conn:
            result = await conn.fetchval(query, user_id)
            return result

    async def get_quotes(self, symbols):
        url = f"{self.base_url}/data/quotes"
        params = {"symbols": ",".join(symbols)}
        
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            data = response.json()
            await self._ingest_quotes(data.get('d', {}))
            return data
        return None

    async def _ingest_quotes(self, quotes_data):
        for symbol, quote in quotes_data.items():
            query = """
                INSERT INTO market_data (time, symbol, exchange, ltp, open_price, high_price, 
                                       low_price, prev_close, change_value, change_percent, volume, bid, ask)
                VALUES (NOW(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            """
            async with db.pg_pool.acquire() as conn:
                await conn.execute(query, 
                    symbol, 'NSE', float(quote.get('lp', 0)),
                    float(quote.get('open_price', 0)), float(quote.get('high_price', 0)),
                    float(quote.get('low_price', 0)), float(quote.get('prev_close_price', 0)),
                    float(quote.get('ch', 0)), float(quote.get('chp', 0)),
                    int(quote.get('volume', 0)), float(quote.get('bid', 0)), float(quote.get('ask', 0)))

    async def get_historical_data(self, symbol, resolution="1D"):
        url = f"{self.base_url}/data/history"
        params = {
            "symbol": symbol,
            "resolution": resolution,
            "date_format": "1",
            "range_from": (datetime.now() - timedelta(days=365)).strftime("%Y-%m-%d"),
            "range_to": datetime.now().strftime("%Y-%m-%d"),
            "cont_flag": "1"
        }
        
        response = requests.get(url, headers=self.headers, params=params)
        if response.status_code == 200:
            data = response.json()
            await self._ingest_historical_data(symbol, resolution, data.get('candles', []))
            return data
        return None

    async def _ingest_historical_data(self, symbol, resolution, candles):
        timeframe_map = {"1": "1m", "5": "5m", "15": "15m", "60": "1h", "1D": "1d"}
        timeframe = timeframe_map.get(resolution, "1d")
        
        for candle in candles:
            timestamp = datetime.fromtimestamp(candle[0])
            query = """
                INSERT INTO historical_data (time, symbol, exchange, timeframe, open, high, low, close, volume)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT DO NOTHING
            """
            async with db.pg_pool.acquire() as conn:
                await conn.execute(query, 
                    timestamp, symbol, 'NSE', timeframe,
                    float(candle[1]), float(candle[2]), float(candle[3]), 
                    float(candle[4]), int(candle[5]))

    async def get_holdings(self):
        url = f"{self.base_url}/holdings"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()
            await self._ingest_holdings(data.get('holdings', []))
            return data
        return None

    async def _ingest_holdings(self, holdings_data):
        for holding in holdings_data:
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
            """
            async with db.pg_pool.acquire() as conn:
                await conn.execute(query,
                    1, holding.get('symbol'), holding.get('exchange', 'NSE'),
                    int(holding.get('qty', 0)), float(holding.get('costPrice', 0)),
                    float(holding.get('ltp', 0)), float(holding.get('marketVal', 0)),
                    float(holding.get('pl', 0)), float(holding.get('plPercent', 0)))