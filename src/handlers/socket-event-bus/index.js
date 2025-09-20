const { createClient } = require("redis");

const EVENT_LISTEN_IN_REDIS = [
  "test", // Thêm các sự kiện bạn muốn lắng nghe từ Redis ở đây
];

// DON'T TOUCH
class SocketEventBus {
  constructor(pubClient, subClient) {
    this.pubClient = pubClient;
    this.subClient = subClient;
  }

  static async getInstance() {
    console.log("Initializing SocketEventBus...");
    const pubClient = createClient({
      url: process.env.REDIS_URL,
    });

    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();
    console.log("✅ Redis clients connected successfully");

    const socketEventBus = new SocketEventBus(pubClient, subClient);

    socketEventBus.subcribe();
    console.log(
      "✅ SocketEventBus instance created and subscribed to events: ",
      EVENT_LISTEN_IN_REDIS
    );

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
    EVENT_LISTEN_IN_REDIS.forEach((event) => {
      this.subClient.subscribe(event, async (message) => {
        if (!event) {
          throw new Error("event is empty, can not subcribe");
        }

        const { userId, data } = JSON.parse(message);
        console.log(`Received message on ${event}:`, { userId, data });

        const room = `${event}_${userId}`;

        console.log(
          "The room what all member of that will be received message is : ",
          room
        );

        const listSocketToEmits = await global.io.in(room).allSockets();

        console.log("listSocketToEmits", listSocketToEmits);

        global.io.to(room).emit(event, data);
      });
    });
  }
}

module.exports = SocketEventBus;
