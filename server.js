const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));

// Route chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Một user đã kết nối:', socket.id);
    
    // Lắng nghe sự kiện 'hello' từ client
    socket.on('hello', (data) => {
        console.log('Hello World'); // In ra console server
        
        // Gửi lại message cho client
        socket.emit('response', 'Hello World từ server!');
        
        // Hoặc broadcast cho tất cả clients
        // io.emit('response', 'Hello World từ server!');
    });
    
    // Xử lý khi user disconnect
    socket.on('disconnect', () => {
        console.log('User đã ngắt kết nối:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});