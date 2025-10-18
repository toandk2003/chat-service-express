const mongoose = require("mongoose");
const Conversation = require("../../models/Conversation");
const { Message } = require("../../models/Message");

const sendMessageHandler = async (socket, socketEventBus) => {
  // Lắng nghe sự kiện 'send_message' từ client
  socket.on("send_message", async (message) => {
    console.log("handle send message event.....");

    const data = JSON.parse(message);
    console.log("data: ", JSON.stringify(data, null, 2));

    try {
      console.log("currentUser: ", JSON.stringify(socket.currentUser, null, 2));

      //TODO checkit
      const user = socket.currentUser.user;

      const conversationId = new mongoose.Types.ObjectId(data.conversationId);
      console.log("conversationId: ", JSON.stringify(conversationId, null, 2));

      // get Conversation
      const conversation = await Conversation.findById(conversationId);

      if (!conversation)
        throw new Error(`Conversation with id: ${conversationId} dont exists.`);
      console.log("conversation: ", JSON.stringify(conversation, null, 2));

      // get all receiver TODO fix it
      const participantIds = conversation.participants
        // .filter((participant) => !participant.userId.equals(userId))
        .map((participant) => participant.userId);

      // send message to them
      console.log("participantIds: " + participantIds);
      const messageWaitingConfirm = await Message.findById(
        new mongoose.Types.ObjectId(data.messageId)
      );
      if (!messageWaitingConfirm) {
        throw new Error(
          "NOT FOUND MESSAGE WITH ID " + data.messageId + " TO CONFIRM"
        );
      }
      messageWaitingConfirm.status = "CONFIRMED";
      await messageWaitingConfirm.save();

      socket.emit("send_message_response", {
        success: true,
        status: 200,
        message: "Send message successfully",
        messageId: data.messageId,
      });

      await socketEventBus.publish(
        "emit_message_for_multi_receiver_in_multi_device",
        {
          user,
          participantIds,
          ...data,
        }
      );
    } catch (error) {
      console.error(error);
      socket.emit("send_message_response", {
        success: false,
        status: 400,
        message: "Send message successfully because messageId is existed.",
        messageId: data.messageId,
      });
    }
  });
};

module.exports = sendMessageHandler;
