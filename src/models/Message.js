const mongoose = require('mongoose');
const BaseSchema = require('./base/BaseSchema.js');

const MessageSchema = new BaseSchema({
  conversationId: { type: String, ref: 'conversations' },
  senderId: { type: String, ref: 'users' },
  recipients: [{
    userId: { type: String, ref: 'users' },
    status: { 
      type: String, 
      enum: ['SENT', 'DELIVERED', 'READ'], 
    },
    readAt: { type: Date }
  }],
  content: String,
  createdAt: { type: Date, default: Date.now }
}, { 
  collection: 'messages',
  timestamps: true 
});


const Message = mongoose.model('messages', MessageSchema);

module.exports = Message;