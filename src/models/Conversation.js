const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");
const MIN_OBJECT_ID = require("../common/constant/minObjectIdConstant");

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
    currentMember: { type: Number, default: 2 },
    participants: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        unreadMessageNums: {
          type: Number,
          default: 0,
        },
        status: {
          type: String,
          enum: ["initial", "running", "invisible"],
          default: "initial",
        },
        lastReadOffset: {
          type: mongoose.Schema.Types.ObjectId,
          default: MIN_OBJECT_ID,
        },
        skipUntilOffset: {
          type: mongoose.Schema.Types.ObjectId,
          default: MIN_OBJECT_ID,
        },
        createdAt: {
          type: Date,
          default: new Date(),
        },
        view: {
          name: String,
          avatar: [
            {
              userId: mongoose.Schema.Types.ObjectId,
              value: String,
            },
          ],
          bucket: {
            type: String,
            default: null,
          },
        },
        isReceiveNoti: {
          type: Boolean,
          default: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    rowVersionFromSpring: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: "conversations",
  }
);

const Conversation = mongoose.model("conversations", ConversationSchema);

module.exports = Conversation;
