const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const cors = require('cors');
const apiAuthMiddleware = require('./src/middleware/apiAuth');

app.use(express.static('public'));
app.use(express.json()); 
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',        // ✅ Allow ALL domains
  methods: '*',       // ✅ Allow ALL HTTP methods  
  allowedHeaders: '*' // ✅ Allow ALL headers
}));
app.use(apiAuthMiddleware);

const helloRoutes = require('./src/routes/TestRoutes.js');
const userController = require('./src/routes/UserRoutes.js');

// Connect to Database
const connectDB = require('./src/config/database');
connectDB();

// Routes API
app.use('/', helloRoutes);
app.use('/', userController); 

// Socket.IO connection handling
const socketHandler = require('./src/handlers/index.js');
socketHandler(io);

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
