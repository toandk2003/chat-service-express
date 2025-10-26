const handleSendMessageToReceiver = async (payload) => {
  console.log(
    "\n\n Sending message to multi receiver----------------------------\n\n"
  );

  payload.messageEntity.recipients.forEach((recipients) => {
    const { messageEntity, ...remain } = payload;
    global.io.to(recipients.userId.toString()).emit("receive_message", remain);
  });
};
module.exports = handleSendMessageToReceiver;
