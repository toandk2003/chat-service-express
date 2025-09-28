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
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversations",
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    recipients: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        status: {
          type: String,
          enum: Object.values(STATUS),
        },
        deliveredAt: { type: Date },
        readAt: { type: Date },
        reaction: {
          type: String,
          enum: Object.values(REACTION),
        },
        reactedAt: { type: Date },
      },
    ],
    content: String,
    orderNumber: Number,
    type: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    attachmentIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "attachments", default: [] },
    ],
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
