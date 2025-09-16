import json
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from shared.database.connections import db

class KafkaManager:
    @staticmethod
    async def publish_event(topic, key, value):
        message = json.dumps(value).encode('utf-8')
        await db.kafka_producer.send(topic, key=key.encode('utf-8'), value=message)

    @staticmethod
    async def create_consumer(topics, group_id):
        consumer = AIOKafkaConsumer(
            *topics,
            bootstrap_servers='localhost:9092',
            group_id=group_id,
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )
        await consumer.start()
        return consumer

class EventPublisher:
    @staticmethod
    async def user_created(user_data):
        await KafkaManager.publish_event('user-events', f"user:{user_data['id']}", {
            'event_type': 'user_created',
            'user_id': user_data['id'],
            'timestamp': user_data['created_at'],
            'data': user_data
        })

    @staticmethod
    async def order_executed(order_data):
        await KafkaManager.publish_event('order-events', f"order:{order_data['id']}", {
            'event_type': 'order_executed',
            'order_id': order_data['id'],
            'user_id': order_data['user_id'],
            'timestamp': order_data['filled_at'],
            'data': order_data
        })

    @staticmethod
    async def portfolio_updated(portfolio_data):
        await KafkaManager.publish_event('portfolio-updates', f"portfolio:{portfolio_data['id']}", {
            'event_type': 'portfolio_updated',
            'portfolio_id': portfolio_data['id'],
            'user_id': portfolio_data['user_id'],
            'timestamp': portfolio_data['updated_at'],
            'data': portfolio_data
        })

    @staticmethod
    async def market_data_updated(market_data):
        await KafkaManager.publish_event('market-data', f"{market_data['symbol']}:{market_data['exchange']}", {
            'event_type': 'price_update',
            'symbol': market_data['symbol'],
            'exchange': market_data['exchange'],
            'timestamp': market_data['time'],
            'data': market_data
        })