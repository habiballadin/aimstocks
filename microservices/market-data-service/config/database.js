const { Pool } = require('pg');
const Redis = require('redis');
const { Kafka } = require('kafkajs');

const pgPool = new Pool({
  host: process.env.TIMESCALE_HOST || 'localhost',
  port: process.env.TIMESCALE_PORT || 5434,
  database: process.env.TIMESCALE_DB || 'stockmarket',
  user: process.env.TIMESCALE_USER || 'postgres',
  password: process.env.TIMESCALE_PASSWORD || 'postgres',
});

const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || 'aimstocks2024',
});

const kafka = new Kafka({
  clientId: 'market-data-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

module.exports = { pgPool, redisClient, kafka };