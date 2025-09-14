const testHandler = require('./testHandler');


// TOUCH IT WHEN YOU ADD NEW HANDLER
const HANDLERS = [
    testHandler,

    // Thêm vào array này khi có handler mới
];




// DON'T TOUCH
const socketHandler = (io) => {
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
};

module.exports = socketHandler;