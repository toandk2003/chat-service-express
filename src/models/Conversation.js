const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const ConversationSchema = new BaseSchema(
  {
    name: String,
    participants: [{ type: String, ref: "users" }], // danh sách user
    type: {
      type: String,
      enum: ["private", "bot"],
      default: "bot",
    },
    maxMember: Number,
    avatar: String,
    bucket: String,
  },
  {
    collection: "conversations",
  }
);

const Conversation = mongoose.model("conversations", ConversationSchema);

module.exports = Conversation;
