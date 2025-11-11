const { createClient } = require("redis");

class SynchronizePublisher {
  constructor(client) {
    this.client = client;
  }

  static async getInstance() {
    console.log("Initializing SynchronizePublisher...");

    const client = createClient({
      url: process.env.REDIS_URL,
    });

    await client.connect();
    console.log("✅ Redis client connected successfully");

    const synchronizePublisher = new SynchronizePublisher(client);
    console.log("✅ SynchronizePublisher instance created");

    return synchronizePublisher;
  }
  async setKey(key, value) {
    this.client.set(key, value);
  }

  async getValue(key) {
    return this.client.get(key);
  }

  /**
   * Push event lên Redis Stream
   * @param {Object} event - Event object
   * @param {string} event.destination - Stream key/name (tên stream)
   * @param {Object|string} event.payload - Data cần gửi
   * @returns {Promise<string>} messageId - ID của message vừa thêm vào stream
   */
  async publish(event) {
    if (!this.client) {
      throw new Error("Redis client is not connected.");
    }

    const { destination, payload } = event;

    if (!destination || !payload) {
      throw new Error(
        `destination and payload are required. Received: destination=${destination}, payload=${payload}`
      );
    }

    try {
      // Chuẩn bị data cho stream
      const streamData = {
        data: payload,
        sentAt: new Date().toISOString(),
      };

      // Push lên Redis Stream với XADD
      const messageId = await this.client.xAdd(
        destination,
        "*", // auto-generate ID
        streamData
      );

      console.log(`📤 Published to stream '${destination}'`);
      console.log(`   Message ID: ${messageId}`);
      console.log(`   Payload:`, payload);

      return messageId;
    } catch (error) {
      console.error(`❌ Error publishing to stream '${destination}':`, error);
      throw new Error(`Failed to publish notification: ${error.message}`);
    }
  }

  /**
   * Đóng connection khi shutdown
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      console.log("✅ Redis client disconnected");
    }
  }
}

module.exports = SynchronizePublisher;
