# Hướng dẫn tạo dự án Express với Socket.IO

## Bước 1: Khởi tạo dự án

```bash
mkdir express-socketio-app
cd express-socketio-app
npm init -y
```

## Bước 2: Cài đặt các dependencies cần thiết

```bash
npm install express socket.io
npm install -D nodemon
```

## Bước 3: Tạo file server.js

```javascript
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

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
    console.log(`Server đang chạy trên port ${PORT}`);
});
```

## Bước 4: Tạo thư mục public và file index.html

```bash
mkdir public
```

Tạo file `public/index.html`:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Express Socket.IO Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 15px 32px;
            text-align: center;
            font-size: 16px;
            border: none;
            cursor: pointer;
            margin: 10px;
        }
        button:hover {
            background-color: #45a049;
        }
        #messages {
            border: 1px solid #ccc;
            padding: 20px;
            margin-top: 20px;
            min-height: 200px;
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <h1>Express Socket.IO Demo</h1>
    <button onclick="sendHello()">Gửi Hello Event</button>
    <div id="messages"></div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const messagesDiv = document.getElementById('messages');

        // Khi kết nối thành công
        socket.on('connect', () => {
            addMessage('Đã kết nối đến server!');
        });

        // Lắng nghe response từ server
        socket.on('response', (data) => {
            addMessage('Server phản hồi: ' + data);
        });

        // Function gửi hello event
        function sendHello() {
            socket.emit('hello', { message: 'Hello từ client!' });
            addMessage('Đã gửi hello event đến server');
        }

        // Function thêm message vào UI
        function addMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `<strong>${new Date().toLocaleTimeString()}:</strong> ${message}`;
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    </script>
</body>
</html>
```

## Bước 5: Cập nhật package.json

Thêm script start vào `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## Bước 6: Chạy ứng dụng

```bash
# Chạy production
npm start

# Hoặc chạy development với nodemon
npm run dev
```

## Cách sử dụng

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Click button "Gửi Hello Event"
3. Kiểm tra console server - sẽ thấy "Hello World" được in ra
4. Trên giao diện web sẽ hiển thị phản hồi từ server

## Cấu trúc thư mục cuối cùng

```
express-socketio-app/
├── node_modules/
├── public/
│   └── index.html
├── server.js
├── package.json
└── package-lock.json
```

## Các tính năng chính

- **Express server** để serve static files và routing
- **Socket.IO** để real-time communication
- **Event handling**: Lắng nghe sự kiện 'hello' và in "Hello World"
- **Bidirectional communication**: Client và server có thể gửi/nhận events
- **Simple UI** để test functionality