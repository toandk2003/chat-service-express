const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const ConversationSchema = new BaseSchema(
  {
    type: {
      type: String,
      enum: ["private", "group", "bot"],
      default: "private",
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    maxMember: { type: Number, default: 2 },
    participants: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        lastReadOffset: mongoose.Schema.Types.ObjectId,
        skipUntilOffset: mongoose.Schema.Types.ObjectId,
      },
    ],
    currentMember: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    hasMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "conversations",
  }
);

const Conversation = mongoose.model("conversations", ConversationSchema);

module.exports = Conversation;
