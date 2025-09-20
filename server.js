const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
global.io = socketIo(server);
const cors = require("cors");
const apiAuthMiddleware = require("./src/middleware/apiAuth");
const clientSocketHandler = require("./src/handlers/client-event");
const SocketEventBus = require("./src/handlers/socket-event-bus");
const connectDB = require("./src/config/database");
const helloRoutes = require("./src/routes/TestRoutes.js");
const userController = require("./src/routes/UserRoutes.js");

const initServer = async () => {
  try {
    app.use(express.static("public"));
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use(
      cors({
        origin: "*", // ✅ Allow ALL domains
        methods: "*", // ✅ Allow ALL HTTP methods
        allowedHeaders: "*", // ✅ Allow ALL headers
      })
    );
    // Khởi tạo SocketEventBus
    const socketEventBus = await SocketEventBus.getInstance();

    console.log("✅ Socket Event Bus initialized successfully");

    app.use(apiAuthMiddleware);
    console.log("✅ Middleware API set up successfully");

    // Kết nối đến cơ sở dữ liệu
    await connectDB();
    console.log("✅ Database connected successfully");

    // Thiết lập xử lý Socket.IO
    await clientSocketHandler(io, socketEventBus);

    // Thiết lập các route
    app.use("/", helloRoutes);
    app.use("/", userController);
    console.log("✅ Routes set up successfully");

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
