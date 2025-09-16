const jwt = require('jsonwebtoken');

// JWT Secret - nên để trong .env file
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Socket.IO JWT Authentication Middleware
 */
const socketAuthMiddleware = (socket, next) => {
    try {
        // Lấy token từ các nguồn khác nhau
        let token = null;
        
        // Cách 1: Từ query parameters (?token=xxx)
        if (socket.handshake.query && socket.handshake.query.token) {
            token = socket.handshake.query.token;
        }
        
        // Không có token
        if (!token) {
            console.log('❌ No token provided for socket connection');
            return next(new Error('Authentication error: No token provided'));
        }
        
        // Verify JWT token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            console.log("token :", token); // Debugging linea
            console.log("JWT_SECRET :", JWT_SECRET); // Debugging linea
            if (err) {
                console.log('❌ Invalid token:', err.message);
                return next(new Error('Authentication error: Invalid token'));
            }
            
            // Attach user data to socket
            socket.currentUser = decoded;
            
            console.log(`✅ User authenticated: ${JSON.stringify(decoded)}`);
            
            // Continue with connection
            next();
        });
        
    } catch (error) {
        console.log('❌ Authentication error:', error.message);
        next(new Error('Authentication error: ' + error.message));
    }
};

module.exports = socketAuthMiddleware;