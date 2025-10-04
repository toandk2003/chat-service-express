const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const connectDB = require("./src/config/database");
const EventChangeStreamService = require("./src/services/eventChangeStreamService");

// console.log = function () {};

const initServer = async () => {
  try {
    // Kết nối đến cơ sở dữ liệu
    await connectDB();
    console.log("✅ Database connected successfully");

    // Khởi động change stream mongoDB
    await (await EventChangeStreamService.getInstance()).start();

    // Khởi động server HTTP
    const PORT = 8889;
    server.listen(PORT, () => {
      console.log(`✅  Job quét oplogs MONGODB  đang chạy trên port ${PORT}`);
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
