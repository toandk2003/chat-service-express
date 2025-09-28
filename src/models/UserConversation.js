const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");
mongoose.set("debug", true);

const UserConversationSchema = new BaseSchema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    rowVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "user_conversations",
  }
);
UserConversationSchema.index({ userId: 1, conversationId: 1 });

const UserConversation = mongoose.model(
  "user_conversations",
  UserConversationSchema
);

module.exports = UserConversation;
