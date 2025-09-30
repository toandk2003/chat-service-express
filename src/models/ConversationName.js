const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const ConversationNameSchema = new BaseSchema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
    },
    name: String,
    type: {
      type: String,
      enum: ["private", "group", "bot"],
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    collection: "conversation_names",
  }
);

const ConversationName = mongoose.model(
  "conversation_names",
  ConversationNameSchema
);

module.exports = ConversationName;
