const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");
const MIN_OBJECT_ID = require("../common/constant/minObjectIdConstant.js");

const StatisticSchema = new BaseSchema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    unreadConversationNums: {
      type: Number,
      default: 0,
    },
    conversations: [
      {
        conversationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "conversations",
        },
        unreadMessageNums: {
          type: Number,
          default: 1,
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
      },
    ],
  },
  {
    collection: "statistics",
  }
);

StatisticSchema.index({ userId: 1 });
const Statistic = mongoose.model("statistics", StatisticSchema);

module.exports = Statistic;
