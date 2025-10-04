const Conversation = require("../../models/Conversation");

const handleSendMessageToReceiver = async (message) => {
  console.log(
    "\n\n Sending message to receiver----------------------------\n\n"
  );

  const { content } = message;
  const userId = new mongoose.Types.ObjectId(message.userId);
  const conversationId = new mongoose.Types.ObjectId(message.conversationId);

  console.log("message: ", JSON.stringify(message, null, 2));
  console.log("userId: ", JSON.stringify(userId, null, 2));
  console.log("conversationId: ", JSON.stringify(conversationId, null, 2));
  console.log("content: ", JSON.stringify(content, null, 2));

  const conversation = await Conversation.findOne({
    _id: conversationId,
  });

  if (!conversation) throw Error("Conversation is not exists");

  const participants = conversation.participants;

  participants
    .filter((participant) => !participant.userId.equals(userId))
    .forEach((participantId) => {
      global.io.to(participantId.toString()).emit("receive_message", content);
    });

  console.log(
    "\n\n Send message to receiver success----------------------------\n\n"
  );
};
module.exports = handleSendMessageToReceiver;
