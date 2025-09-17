const mongoose = require('mongoose');
const BaseSchema = require('./base/BaseSchema.js');

const ConversationSchema = new BaseSchema({
  name: String,
  participants: [{ type: String, ref: 'users' }], // danh sách userId
  type: String,
  createdAt: { type: Date, default: Date.now }

}, { 
  collection: 'conversations',
  timestamps: true 
});


const Conversation = mongoose.model('conversations', ConversationSchema);

module.exports = Conversation;