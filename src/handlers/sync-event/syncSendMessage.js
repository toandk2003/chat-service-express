const Conversation = require("../../models/Conversation");
const mongoose = require("mongoose");

const syncSendMessage = async (data) => {
  console.log("syncing sendMessage.....");
  const { user, messageId, messgeType, content, attachments } = data;

  const userId = new mongoose.Types.ObjectId(user._id);

  console.log("data: ", JSON.stringify(data, null, 2));

  const conversationId = new mongoose.Types.ObjectId(data.conversationId);
  console.log("conversationId: ", JSON.stringify(conversationId, null, 2));

  const conversation = await Conversation.findById(conversationId);

  if (!conversation)
    throw new Error(`Conversation with id: ${conversationId} dont exists.`);
  console.log("conversation: ", JSON.stringify(conversation, null, 2));

  // get all receiver
  const participantIds = conversation.participants
    .filter((participant) => !participant.userId.equals(userId))
    .map((participant) => participant.userId);

  // send message to them
  console.log("participants: " + participantIds.length);

  // return await withTransactionThrow(async (session, data) => {
  //   console.log("xinchao");

  //   // await socketEventBus.publish("receive_message", {
  //   //   userId: 1,
  //   //   conversationId: 1,
  //   //   data: "UOW",
  //   // });
  // }, data);
};

module.exports = syncSendMessage;
