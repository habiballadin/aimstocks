import asyncio
from aiokafka import AIOKafkaConsumer
from shared.database.connections import db
from datetime import datetime

class ClickHouseIngestion:
    def __init__(self):
        self.consumer = None

    async def start_consumer(self):
        """Start Kafka consumer for analytics ingestion"""
        self.consumer = AIOKafkaConsumer(
            'market-data', 'order-events', 'portfolio-updates',
            bootstrap_servers='localhost:9092',
            group_id='clickhouse-ingestion'
        )
        await self.consumer.start()

        try:
            async for message in self.consumer:
                await self.process_message(message)
        finally:
            await self.consumer.stop()

    async def process_message(self, message):
        """Process Kafka messages and insert into ClickHouse"""
        topic = message.topic
        data = message.value

        if topic == 'market-data':
            await self.insert_market_history(data)
        elif topic == 'order-events':
            await self.insert_trade_execution(data)
        elif topic == 'portfolio-updates':
            await self.insert_portfolio_snapshot(data)

    async def insert_market_history(self, market_data):
        """Insert market data into ClickHouse"""
        query = """
            INSERT INTO market_history (timestamp, symbol, price, volume, bid, ask, bid_size, ask_size)
            VALUES
        """
        
        data = market_data.get('data', {})
        values = (
            datetime.now(),
            data.get('symbol'),
            data.get('ltp'),
            data.get('volume', 0),
            data.get('bid', 0),
            data.get('ask', 0),
            0,  # bid_size
            0   # ask_size
        )
        
        db.clickhouse_client.execute(query, [values])

    async def insert_trade_execution(self, order_data):
        """Insert trade execution into ClickHouse"""
        query = """
            INSERT INTO trade_executions (timestamp, user_id, symbol, side, quantity, price, commission)
            VALUES
        """
        
        data = order_data.get('data', {})
        values = (
            datetime.now(),
            data.get('user_id'),
            data.get('symbol'),
            data.get('side'),
            data.get('filled_quantity', 0),
            data.get('filled_price', 0),
            data.get('commission', 0)
        )
        
        db.clickhouse_client.execute(query, [values])

    async def insert_portfolio_snapshot(self, portfolio_data):
        """Insert portfolio snapshot into ClickHouse"""
        query = """
            INSERT INTO portfolio_snapshots (timestamp, user_id, portfolio_id, total_value, cash_balance, positions_value)
            VALUES
        """
        
        data = portfolio_data.get('data', {})
        values = (
            datetime.now(),
            data.get('user_id'),
            data.get('id'),
            data.get('total_value', 0),
            data.get('cash_balance', 0),
            data.get('total_value', 0) - data.get('cash_balance', 0)  # positions_value
        )
        
        db.clickhouse_client.execute(query, [values])

    async def run(self):
        """Run ClickHouse ingestion service"""
        db.init_clickhouse()
        await self.start_consumer()

if __name__ == "__main__":
    ingestion = ClickHouseIngestion()
    asyncio.run(ingestion.run())