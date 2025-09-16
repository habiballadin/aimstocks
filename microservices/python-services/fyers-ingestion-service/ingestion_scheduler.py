import asyncio
from datetime import datetime
from fyers_client import FyersClient
from shared.database.connections import db

class IngestionScheduler:
    def __init__(self, user_id=1):
        self.user_id = user_id
        self.fyers_client = FyersClient(user_id=user_id)
        self.symbols = [
            "NSE:RELIANCE-EQ", "NSE:TCS-EQ", "NSE:INFY-EQ", 
            "NSE:HDFCBANK-EQ", "NSE:ICICIBANK-EQ", "NSE:WIPRO-EQ",
            "NSE:LT-EQ", "NSE:BHARTIARTL-EQ", "NSE:MARUTI-EQ", "NSE:ASIANPAINT-EQ"
        ]

    async def start_real_time_ingestion(self):
        """Start real-time market data ingestion"""
        while True:
            try:
                await self.fyers_client.get_quotes(self.symbols)
                await asyncio.sleep(1)  # 1 second interval
            except Exception as e:
                print(f"Real-time ingestion error: {e}")
                await asyncio.sleep(5)

    async def ingest_historical_data(self):
        """Ingest historical data for all symbols"""
        for symbol in self.symbols:
            try:
                # Daily data
                await self.fyers_client.get_historical_data(symbol, "1D")
                # Hourly data
                await self.fyers_client.get_historical_data(symbol, "60")
                await asyncio.sleep(0.5)  # Rate limiting
            except Exception as e:
                print(f"Historical ingestion error for {symbol}: {e}")

    async def ingest_user_data(self):
        """Ingest user profile, funds, and holdings"""
        try:
            await self.fyers_client.get_holdings()
            print("User data ingested successfully")
        except Exception as e:
            print(f"User data ingestion error: {e}")

    async def run_scheduler(self):
        """Run all ingestion tasks"""
        await db.init_postgres()
        await db.init_redis()
        await db.init_kafka()
        await self.fyers_client.init_client()
        
        # Start background tasks
        tasks = [
            asyncio.create_task(self.start_real_time_ingestion()),
            asyncio.create_task(self.periodic_historical_update()),
            asyncio.create_task(self.periodic_user_data_update())
        ]
        
        await asyncio.gather(*tasks)

    async def periodic_historical_update(self):
        """Update historical data every hour"""
        while True:
            await asyncio.sleep(3600)  # 1 hour
            await self.ingest_historical_data()

    async def periodic_user_data_update(self):
        """Update user data every 5 minutes"""
        while True:
            await asyncio.sleep(300)  # 5 minutes
            await self.ingest_user_data()

if __name__ == "__main__":
    user_id = 1  # Default user ID
    scheduler = IngestionScheduler(user_id)
    asyncio.run(scheduler.run_scheduler())