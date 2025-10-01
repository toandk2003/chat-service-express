const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const ConversationViewSchema = new BaseSchema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
    },
    name: String,
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    avatar: {
      type: String,
      default: null,
    },
    bucket: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["private", "group", "bot"],
      default: "private",
    },
  },
  {
    collection: "conversation_views",
  }
);

const ConversationView = mongoose.model(
  "conversation_views",
  ConversationViewSchema
);

module.exports = ConversationView;
