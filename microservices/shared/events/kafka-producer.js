class KafkaProducer {
  constructor(kafka) {
    this.producer = kafka.producer();
  }

  async connect() {
    await this.producer.connect();
  }

  async publishEvent(topic, key, value) {
    await this.producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }],
    });
  }

  async disconnect() {
    await this.producer.disconnect();
  }
}

module.exports = KafkaProducer;