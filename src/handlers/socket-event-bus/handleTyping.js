const handleTyping = async (message) => {
  console.log("emit typing   .....");
  console.log("message: " + JSON.stringify(message.ourConvesation, null, 2));

  const { email, ourConversation } = message;
  const response = {
    email,
    conversationId: ourConversation._id,
    sentAt: new Date().toISOString(),
  };

  ourConversation.participants.forEach((participant) => {
    const userId = participant.userId;
    global.io.to(userId.toString()).emit("typing", response);
  });

  console.log("emit typing success.....");
};
module.exports = handleTyping;
