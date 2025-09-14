const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Kết nối đến MongoDB server port 30000
        const conn = await mongoose.connect('mongodb://localhost:30000/chat_service');

        console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Event listeners
mongoose.connection.on('disconnected', () => {
    console.log('📤 MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
    console.log('📥 MongoDB connected');
});

module.exports = connectDB;