const Test = require("../../models/Test");
const mongoose = require("mongoose");
const Message = require("../../models/Message");
const withTransactionThrow = require("../../common/utils/withTransactionThrow");
const Conversation = require("../../models/Conversation");
const { User } = require("../../models/User");
const createEvent = require("../../common/utils/createEventEntity");
const SynchronizePublisher = require("../../messageBroker/synchronizePublisher");
const Event = require("../../models/event");

const sendMessageHandler = async (socket, socketEventBus) => {
  // Lắng nghe sự kiện 'send_message' từ client
  socket.on("send_message", async (message) => {
    console.log("handle send message event.....");
    console.log("currentUser: ", JSON.stringify(socket.currentUser, null, 2));

    const data = JSON.parse(message);
    console.log("data: ", JSON.stringify(data, null, 2));

    const event = createEvent({
      eventType: "SYNC_SEND_MESSAGE",
      ...data,
      user: socket.currentUser.user,
    });
    await Event.create(event);

    socket.emit("send_message_response", {
      success: true,
      message: "Send message successfully",
      messageId: data.messageId,
    });
  });
};

module.exports = sendMessageHandler;
