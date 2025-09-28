const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const ConversationSchema = new BaseSchema(
  {
    name: { type: String, default: null },
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
    maxMember: { type: Number, default: 3 },
    avatar: {
      type: String,
      default: null,
    },
    bucket: {
      type: String,
      default: null,
    },
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
