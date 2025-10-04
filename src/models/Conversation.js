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
    participants: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        unreadMessageNums: {
          type: Number,
          default: 0,
        },
        lastReadOffset: {
          type: mongoose.Schema.Types.ObjectId,
          default: MIN_OBJECT_ID,
        },
        skipUntilOffset: {
          type: mongoose.Schema.Types.ObjectId,
          default: MIN_OBJECT_ID,
        },
      },
    ],
    currentMember: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    collection: "conversations",
  }
);

const Conversation = mongoose.model("conversations", ConversationSchema);

module.exports = Conversation;
