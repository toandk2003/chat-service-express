const Test = require("../../models/Test");
const Message = require("../../models/Message");
const withTransactionThrow = require("../../common/utils/withTransactionThrow");
const sendMessageHandler = (socket, socketEventBus) => {
  // Lắng nghe sự kiện 'send_message' từ client
  socket.on("send_message", async (data) => {
    console.log("handle send message event.....");
    console.log("data: ", JSON.stringify(data, null, 2)); // In ra console server

    return await withTransactionThrow(async (session, data) => {
      console.log("xinchao");

      await socketEventBus.publish("receive_message", {
        userId: 1,
        conversationId: 1,
        data: "UOW",
      });
    }, data);
  });
};

module.exports = sendMessageHandler;
