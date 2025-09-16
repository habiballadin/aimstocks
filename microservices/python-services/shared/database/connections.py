import os
import asyncpg
import redis.asyncio as redis
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from clickhouse_driver import Client

class DatabaseConnections:
    def __init__(self):
        self.pg_pool = None
        self.redis_client = None
        self.kafka_producer = None
        self.clickhouse_client = None

    async def init_postgres(self):
        self.pg_pool = await asyncpg.create_pool(
            host=os.getenv('TIMESCALE_HOST', 'localhost'),
            port=int(os.getenv('TIMESCALE_PORT', 5434)),
            database=os.getenv('TIMESCALE_DB', 'stockmarket'),
            user=os.getenv('TIMESCALE_USER', 'postgres'),
            password=os.getenv('TIMESCALE_PASSWORD', 'postgres'),
            min_size=5,
            max_size=20
        )

    async def init_redis(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            password=os.getenv('REDIS_PASSWORD', 'aimstocks2024'),
            decode_responses=True
        )

    async def init_kafka(self):
        self.kafka_producer = AIOKafkaProducer(
            bootstrap_servers=os.getenv('KAFKA_BROKER', 'localhost:9092')
        )
        await self.kafka_producer.start()

    def init_clickhouse(self):
        self.clickhouse_client = Client(
            host=os.getenv('CLICKHOUSE_HOST', 'localhost'),
            port=int(os.getenv('CLICKHOUSE_PORT', 9000)),
            database=os.getenv('CLICKHOUSE_DB', 'analytics'),
            user=os.getenv('CLICKHOUSE_USER', 'default'),
            password=os.getenv('CLICKHOUSE_PASSWORD', '')
        )

db = DatabaseConnections()