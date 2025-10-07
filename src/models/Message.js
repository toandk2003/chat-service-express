const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const STATUS = Object.freeze({
  SENT: "SENT",
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
        reaction: {
          type: String,
          enum: Object.values(REACTION),
          default: null,
        },
        reactedAt: { type: Date },
        status: {
          type: String,
          enum: ["visible", "invisible"],
          default: "visible",
        },
      },
    ],
    reaction: {
      type: String,
      enum: Object.values(REACTION),
      default: null,
    },
    reactedAt: { type: Date },
    content: String,
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "notification"],
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
MessageSchema.index({ conversationId: 1 });
const Message = mongoose.model("messages", MessageSchema);

module.exports = {
  Message,
  STATUS,
  REACTION,
};
