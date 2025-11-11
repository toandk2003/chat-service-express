const { default: mongoose } = require("mongoose");
const SynchronizePublisher = require("../../messageBroker/synchronizePublisher");
const Conversation = require("../../models/Conversation");

const typing = async (socket, socketEventBus) => {
  // Lắng nghe sự kiện 'send_message' từ client
  socket.on("typing", async (message) => {
    console.log("handle typing event.....");
    const data = JSON.parse(message);
    console.log("data: ", JSON.stringify(data, null, 2));

    try {
      const email = socket.currentUser.user.email;
      const { conversationId } = data;
      console.log("conversationId is : ", conversationId);
      const ourConversation = await Conversation.findById(
        new mongoose.Types.ObjectId(conversationId)
      );
      if (!ourConversation) throw new Error("CONVERSATION NOT EXIST");

      const synchronizePublisher = await SynchronizePublisher.getInstance();
      const event = {
        destination: "sync-stream",
        payload: JSON.stringify({
          eventType: "TYPING",
          ourConversation,
          email,
        }),
      };
      await synchronizePublisher.publish(event);
    } catch (error) {
      console.error(error);
      socket.emit("send_message_response", {
        success: false,
        status: 400,
        message: "Ping online fail because " + error.message,
      });
    }
  });
};

module.exports = typing;
