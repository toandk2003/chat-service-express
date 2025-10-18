const mongoose = require("mongoose");
const BaseSchemaNoOptimistic = require("./base/BaseSchemaNoOptimistic.js");
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
    replyForMessgeId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
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
        reactedAt: { type: Date, default: null },
        status: {
          type: String,
          enum: ["sent", "seen", "unsent"],
          default: "sent",
        },
      },
    ],
    reaction: {
      type: String,
      enum: Object.values(REACTION),
      default: null,
    },
    reactedAt: { type: Date, default: null },
    content: String,
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "notification"],
      default: "text",
    },
    attachments: [
      {
        originalFileName: String,
        fileSize: Number,
        bucket: String,
        contentType: String,
        key: String,
        status: {
          type: String,
          enum: ["ACTIVE", "INACTIVE"],
          default: "ACTIVE",
        },
      },
    ],
    status: {
      type: String,
      enum: ["WAITING_CONFIRM", "CONFIRMED", "DELETED"],
      default: "WAITING_CONFIRM",
    },
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
