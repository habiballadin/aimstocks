class RedisManager {
  constructor(redisClient) {
    this.client = redisClient;
  }

  async set(key, value, ttl = 3600) {
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async get(key) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key) {
    await this.client.del(key);
  }

  async publish(channel, message) {
    await this.client.publish(channel, JSON.stringify(message));
  }
}

module.exports = RedisManager;