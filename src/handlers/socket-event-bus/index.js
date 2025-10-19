const { createClient } = require("redis");
const handleSendMessageToReceiver = require("./handleSendMessageToReceiver");
const handleSendSeenStatusToReceiver = require("./handleSendSeenStatusToReceiver");

// DON'T TOUCH
class SocketEventBus {
  constructor(pubClient, subClient) {
    this.pubClient = pubClient;
    this.subClient = subClient;
  }

  static instance = null;

  static async getInstance() {
    console.log("Initializing SocketEventBus...");

    if (SocketEventBus.instance) {
      console.log("Returning existing SocketEventBus instance");
      return SocketEventBus.instance;
    }

    const pubClient = createClient({
      url: process.env.REDIS_URL,
    });

    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();
    console.log("✅ Redis clients connected successfully");

    const socketEventBus = new SocketEventBus(pubClient, subClient);

    socketEventBus.subcribe();
    
    SocketEventBus.instance = socketEventBus;

    return socketEventBus;
  }

  async publish(event, data) {
    if (!this.pubClient) {
      throw new Error("Redis publisher client is not connected.");
    }
    if (!event || !data) {
      throw new Error(
        "event, data are required, this is those values: ",
        event + " " + data
      );
    }

    await this.pubClient.publish(event, JSON.stringify(data));

    console.log(`Published event '${event}' with data:`, data);
  }

  subcribe() {
    // send message to receiver
    this.subClient.subscribe(
      "emit_message_for_multi_receiver_in_multi_device",
      async (message) => {
        await handleSendMessageToReceiver(JSON.parse(message));
      }
    );

    this.subClient.subscribe(
      "emit_seen_status_for_multi_receiver_in_multi_device",
      async (message) => {
        await handleSendSeenStatusToReceiver(JSON.parse(message));
      }
    );
  }
}

module.exports = SocketEventBus;
