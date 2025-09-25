const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");
const { create } = require("../controller/UserController.js");

const STATUS = Object.freeze({
  READ: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
});

const REACTION = Object.freeze({
  LIKE: "LIKE",
  TYM: "TYM",
  UNLIKE: "UNLIKE",
  ANGRY: "ANGRY",
  CONFUSED: "CONFUSED",
});

const MessageSchema = new BaseSchema(
  {
    conversationId: { type: String, ref: "conversations" },
    senderId: { type: String, ref: "users" },
    recipients: [
      {
        userId: { type: String, ref: "users" },
        status: {
          type: String,
          enum: Object.values(STATUS),
        },
        readAt: { type: Date },
        reaction: {
          type: String,
          enum: Object.values(REACTION),
        },
        reactedAt: { type: Date },
      },
    ],
    content: String,
    type: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    attachments: [{ type: String, ref: "attachments", default: [] }],
  },
  {
    collection: "messages",
  }
);

const Message = mongoose.model("messages", MessageSchema);

module.exports = {
  Message,
  STATUS,
  REACTION,
};
