const testHandler = require("./testHandler");
const socketAuthMiddleware = require("../../middleware/socketAuth");
const { createAdapter } = require("@socket.io/redis-adapter");

// TOUCH IT WHEN YOU ADD NEW HANDLER
const HANDLERS = [
  testHandler,

  // Thêm vào array này khi có handler mới
];

// DON'T TOUCH
const clientSocketHandler = async (io, socketEventBus) => {
  console.log("Setting up Socket.IO handlers...");
  console.log("Redis URL = ", process.env.REDIS_URL);
  
  io.use(socketAuthMiddleware);
  console.log("✅ Socket.IO auth middleware applied");

  io.adapter(createAdapter(socketEventBus.pubClient, socketEventBus.subClient));
  console.log("✅ Socket.IO Redis adapter configured");

  io.on("connection", (socket) => {
    console.log("One user connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });

    HANDLERS.forEach((handler, index) => {
      if (typeof handler === "function") {
        handler(socket, socketEventBus);
        console.log(
          `🔧 Applied handler ${index + 1}/${HANDLERS.length} - ${
            handler.name || "anonymous"
          }`
        );
      }
    });
  });

  io.engine.on("connection_error", (err) => {
    console.log("🚫 Connection error:", err.req);
    console.log("🚫 Error code:", err.code);
    console.log("🚫 Error message:", err.message);
    console.log("🚫 Error context:", err.context);
  });
};

module.exports = clientSocketHandler;
