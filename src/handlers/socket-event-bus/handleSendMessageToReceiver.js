const handleSendMessageToReceiver = async (payload) => {
  console.log(
    "\n\n Sending message to multi receiver----------------------------\n\n"
  );
  const { user, participantIds, ...data } = payload;

  participantIds.forEach((participantId) => {
    global.io.to(participantId.toString()).emit("receive_message", {
      senderId: user._id,
      senderEmail: user.email,
      conversationId: data.conversationId,
      messageType: data.messageType,
      content: data.content,
      createdAt: new Date(),
    });
  });
};
module.exports = handleSendMessageToReceiver;
