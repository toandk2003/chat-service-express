const testHandler = require('./testHandler');
const socketAuthMiddleware = require('../middleware/socketAuth');


// TOUCH IT WHEN YOU ADD NEW HANDLER
const HANDLERS = [
    testHandler,

    // Thêm vào array này khi có handler mới
];




// DON'T TOUCH
const socketHandler = (io) => {
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        console.log('One user connected:', socket.id);
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
    });

    HANDLERS.forEach((handler, index) => {
            if (typeof handler === 'function') {
                handler(socket);
                console.log(            
                    `🔧 Applied handler ${index + 1}/${HANDLERS.length} - ${handler.name || 'anonymous'}`
                );
            }
        });
    });

    io.engine.on("connection_error", (err) => {
        console.log('🚫 Connection error:', err.req);
        console.log('🚫 Error code:', err.code);
        console.log('🚫 Error message:', err.message);
        console.log('🚫 Error context:', err.context);
    });
};

module.exports = socketHandler;