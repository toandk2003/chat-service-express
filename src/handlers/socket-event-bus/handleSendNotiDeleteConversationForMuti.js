const handleSendNotiDeleteConversationForMuti = async (message) => {
  console.log("emit delete conver  .....");
  console.log("message: " + JSON.stringify(message, null, 2));

  message.data.actionUserId.forEach((userId) => {
    global.io.to(userId.toString()).emit("deleteGroup", message);
  });

  message.data.remainMemberIds.forEach((userId) => {
    global.io
      .to(userId.toString())
      .emit("deleteGroup_updateMemberList", message);
  });

  console.log("emit delete-conver success.....");
};
module.exports = handleSendNotiDeleteConversationForMuti;
