const jwt = require('jsonwebtoken');

// JWT Secret - nên để trong .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * API JWT Authentication Middleware
 */
const apiAuthMiddleware = (req, res, next) => {
    try {
        // Lấy token từ các nguồn khác nhau
        let token = null;
        
        // Cách 1: Từ Authorization header (Bearer token)
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }
        
       
        // Không có token
        if (!token) {
            // console.log('❌ No token provided for API request');
            return res.status(401).json({
                success: false,
                message: 'Authentication error: No token provided',
                error: 'NO_TOKEN'
            });
        }
        
        // Verify JWT token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            console.log("token :", token); // Debugging line
            console.log("JWT_SECRET :", JWT_SECRET); // Debugging line
            
            if (err) {
                console.log('❌ Invalid token:', err.message);
                return res.status(401).json({
                    success: false,
                    message: 'Authentication error: Invalid token',
                    error: 'INVALID_TOKEN',
                    details: err.message
                });
            }
            
            // Attach user data to request object
            req.currentUser = decoded;
            req.user = decoded; // Alternative property name
            
            console.log(`✅ User authenticated: ${JSON.stringify(decoded)}`);
            
            // Continue to next middleware/route handler
            next();
        });
        
    } catch (error) {
        console.log('❌ Authentication error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Authentication error: ' + error.message,
            error: 'AUTH_ERROR'
        });
    }
};

module.exports = apiAuthMiddleware;