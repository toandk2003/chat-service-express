const SynchronizePublisher = require("../../messageBroker/synchronizePublisher");

const pingOnlineHandler = async (socket, socketEventBus) => {
  // Lắng nghe sự kiện 'send_message' từ client
  socket.on("ping_online", async (message) => {
    console.log("handle ping online event.....");

    try {
      let email = socket.currentUser.user.email;
      const synchronizePublisher = await SynchronizePublisher.getInstance();
      const key = "last_online_" + email;
      await synchronizePublisher.setKey(key, new Date().toISOString());
    } catch (error) {
      console.error(error);
      socket.emit("send_message_response", {
        success: false,
        status: 400,
        message: "Ping online fail because " + error.message,
        messageId: data.messageId,
      });
    }
  });
};

module.exports = pingOnlineHandler;
