// services/notificationConsumer.js
const { createClient } = require("redis");
const sync = require("./sync");

class SyncConsumer {
  constructor() {
    this.streamName = process.env.SYNC_STREAM;
    this.groupName = process.env.SYNC_GROUP;
    this.consumerName = process.env.SYNC_CONSUMER;
    this.redisClient = null;
  }

  async getInstance() {
    try {
      console.log("Initializing SyncConsumer...");
      this.redisClient = createClient({
        url: process.env.REDIS_URL,
      });

      // Event listeners
      this.redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.isConnected = false;
      });

      this.redisClient.on("connect", () => {
        console.log("Redis Client Connected");
        this.isConnected = true;
      });

      this.redisClient.on("ready", () => {
        console.log("Redis Client Ready");
      });

      this.redisClient.on("end", () => {
        console.log("Redis Client Disconnected");
        this.isConnected = false;
      });

      await this.redisClient.connect();

      // Tạo consumer group nếu chưa tồn tại
      await this.createConsumerGroup();

      console.log(
        `Consumer initialized: ${this.consumerName} in group: ${this.groupName}`
      );

      return this;
    } catch (error) {
      console.error("Failed to initialize consumer:", error);
      throw error;
    }
  }

  async createConsumerGroup() {
    try {
      // XGROUP CREATE stream groupName id MKSTREAM
      await this.redisClient.xGroupCreate(
        this.streamName, // stream name
        this.groupName, // group name
        "0", // start from beginning (0) or '$' for new messages
        {
          MKSTREAM: true, // tạo stream nếu chưa tồn tại
        }
      );
      console.log(`Current stream: ${this.streamName} `);
      console.log(`Created consumer group: ${this.groupName}`);
    } catch (error) {
      if (error.message.includes("BUSYGROUP")) {
        console.log(`Current stream: ${this.streamName} `);
        console.log(`Consumer group already exists: ${this.groupName}`);
      } else {
        console.error("Error creating consumer group:", error);
        throw error;
      }
    }
  }

  async startConsuming() {
    console.log(`Starting consumer: ${this.consumerName}`);

    while (true) {
      try {
        // this.redisClient.xReadGroup(
        //     this.groupName,
        //     this.consumerName,
        //     [{ key: this.streamName, id: "0" }],
        //     { COUNT: 10, BLOCK: 0 }
        //   ),
        // Đọc cả pending và new messages song song
        const newMessages = await this.redisClient.xReadGroup(
          this.groupName,
          this.consumerName,
          [{ key: this.streamName, id: ">" }],
          { COUNT: 50, BLOCK: 5000 } // Block cho messages mới
        );

        // // Xử lý pending trước
        // if (pendingMessages && pendingMessages.length > 0) {
        //   await this.processMessages(pendingMessages);
        // }

        // Sau đó xử lý new messages
        if (newMessages && newMessages.length > 0) {
          await this.processMessages(newMessages);
        }
      } catch (error) {
        console.error("Error reading from stream:", error);
        throw error;
      }
    }
  }

  async processMessages(messages) {
    for (const stream of messages) {
      console.log("duplicate: ", stream.messages.length);

      for (const message of stream.messages) {
        try {
          await this.processMessage(message);

          // Acknowledge message sau khi xử lý thành công
          await this.acknowledgeMessage(message.id);
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error);
          throw error;
        }
      }
    }
  }

  async processMessage(message) {
    console.log(
      "\n-----------------------------new message---------------------------"
    );
    console.log(
      `✅ Processing message: ${message.id} sent at ${message.message.sentAt}`
    );

    let data = null;
    try {
      data = JSON.parse(JSON.parse(message.message.data));
    } catch (error) {
      data = JSON.parse(message.message.data);
    }

    console.log("Handle Event with data is Object Javascript: ", data);

    await sync(data);
  }

  async acknowledgeMessage(messageId) {
    try {
      // XACK stream group messageId
      await this.redisClient.xAck(this.streamName, this.groupName, messageId);
      console.log(`Acknowledged message: ${messageId}`);
    } catch (error) {
      console.error(`Failed to acknowledge message ${messageId}:`, error);
    }
  }
}

module.exports = new SyncConsumer();
