const Conversation = require("../../models/Conversation");
const createEvent = require("../../common/utils/createEventEntity");

const mongoose = require("mongoose");
const Event = require("../../models/event");
const { Message } = require("../../models/Message");

const syncSendMessage = async (message) => {
  console.log("syncing sendMessage.....");
  console.log("message: " + JSON.stringify(message, null, 2));

  const messageId = new mongoose.Types.ObjectId(message._id);
  const conversationId = new mongoose.Types.ObjectId(message.conversationId);
  const messageType = message.type;

  if (messageType === "text") {
    console.log("messageId: " + messageId);
    console.log("conversationId: " + conversationId);

    // const conversation = await Conversation.findById(conversationId);
    // if (!conversation) {
    //   console.log("No exist conversation with id = ", conversationId);
    //   throw new Error(`No exist conversation with id = ${conversationId}`);
    // }
    // update count variable in conversation + user
  }
};

module.exports = syncSendMessage;
