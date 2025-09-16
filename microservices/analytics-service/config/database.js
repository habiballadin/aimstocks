const { createClient } = require('@clickhouse/client');
const Redis = require('redis');
const { Kafka } = require('kafkajs');

const clickhouseClient = createClient({
  host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
  database: process.env.CLICKHOUSE_DB || 'analytics',
  username: process.env.CLICKHOUSE_USER || 'default',
  password: process.env.CLICKHOUSE_PASSWORD || '',
});

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || 'aimstocks2024',
});

const kafka = new Kafka({
  clientId: 'analytics-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

module.exports = { clickhouseClient, redisClient, kafka };