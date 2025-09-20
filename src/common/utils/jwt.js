const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET ;

class JWTUtils {
    
    /**
     * Verify JWT token
     */
    static verifyToken(token) {
        console.log("JWT_SECRET in verifyToken:", JWT_SECRET); 
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token: ' + error.message);
        }
    }
    
    /**
     * Decode JWT without verification (for debugging)
     */
    static decodeToken(token) {
        return jwt.decode(token, { complete: true });
    }
}

module.exports = JWTUtils;