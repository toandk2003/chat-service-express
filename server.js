const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.use(express.static('public'));
app.use(express.json()); 

const connectDB = require('./src/config/database');
connectDB();

// Socket.IO connection handling
const socketHandler = require('./src/handlers/index.js');
socketHandler(io);

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
