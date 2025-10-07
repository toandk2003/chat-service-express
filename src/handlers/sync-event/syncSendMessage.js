const Conversation = require("../../models/Conversation");
const createEvent = require("../../common/utils/createEventEntity");

const mongoose = require("mongoose");
const Event = require("../../models/event");
const { Message } = require("../../models/Message");

const syncSendMessage = async (data) => {
  console.log("syncing sendMessage.....");
  console.log("data: " + JSON.stringify(data, null, 2));
  let { messageId, conversationId, messageType, content, user } = data;
  if (messageType === "TEXT") {
    messageId = new mongoose.Types.ObjectId(messageId);
    conversationId = new mongoose.Types.ObjectId(conversationId);
    console.log("messageId: " + messageId);
    console.log("conversationId: " + conversationId);

    const message = await Message.findById(messageId);
    if (message) {
      console.log("this is duplicate message");
      return;
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log("No exist conversation with id = ", conversationId);
      throw new Error(`No exist conversation with id = ${conversationId}`);
    }

    const participants = conversation.participants;


    // recipients: [
    //       {
    //         userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    //         status: {
    //           type: String,
    //           enum: Object.values(STATUS),
    //           default: STATUS.SENT,
    //         },
    //         deliveredAt: { type: Date },
    //         readAt: { type: Date },
    //         reaction: {
    //           type: String,
    //           enum: Object.values(REACTION),
    //           default: null,
    //         },
    //         reactedAt: { type: Date },
    //       },
    //     ],
    // insert messsage
    // const newMessage = {
    //   senderId: user._id,
    //   conversationId,
    //   recipients: 
    // };
    // await Message.create(newMessage);

    // update count variable in conversation + user
  }
};

module.exports = syncSendMessage;
