const handleSendMessageToReceiver = async (payload) => {
  console.log(
    "\n\n Sending message to multi receiver----------------------------\n\n"
  );
  const { user, message } = payload;

  message.recipients.forEach((recipients) => {
    global.io.to(recipients.userId.toString()).emit("receive_message", {
      message,
    });
  });
};
module.exports = handleSendMessageToReceiver;
