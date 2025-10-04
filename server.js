const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const apiAuthMiddleware = require("./src/middleware/apiAuth");
const clientSocketHandler = require("./src/handlers/client-event");
const SocketEventBus = require("./src/handlers/socket-event-bus");
const connectDB = require("./src/config/database");
const fileRoutes = require("./src/routes/fileRoutes");
const syncConsumer = require("./src/handlers/sync-event");
const EventChangeStreamService = require("./src/services/eventChangeStreamService");

global.io = socketIo(server, {
  cors: {
    origin: "*", // Cho phép tất cả các origin
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

const initServer = async () => {
  try {
    app.use(
      cors({
        origin: "*", // ✅ Allow ALL domains
        methods: "*", // ✅ Allow ALL HTTP methods
        allowedHeaders: "*", // ✅ Allow ALL headers
      })
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Khởi tạo SocketEventBus
    const socketEventBus = await SocketEventBus.getInstance();
    console.log("✅ Socket Event Bus initialized successfully");

    // Thiết lập middleware xác thực API
    app.use(apiAuthMiddleware);
    console.log("✅ Middleware API set up successfully");

    // Kết nối đến cơ sở dữ liệu
    await connectDB();
    console.log("✅ Database connected successfully");

    // Thiết lập xử lý Socket.IO
    await clientSocketHandler(io, socketEventBus);

    // Thiết lập các route
    app.use("/", fileRoutes);

    console.log("✅ Routes set up successfully");

    // Khởi động sync consumer
    (await syncConsumer.getInstance()).startConsuming();

    // Khởi động change stream mongoDB
    await (await EventChangeStreamService.getInstance()).start();

    // Khởi động server HTTP
    const PORT = process.env.PORT;
    server.listen(PORT, () => {
      console.log(`Server đang chạy trên port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize server:", error);
    process.exit(1); // Thoát ứng dụng nếu khởi tạo thất bại
  }
};

initServer().catch((err) => {
  console.error("❌ Fatal error during server initialization:", err);
  process.exit(1);
});
