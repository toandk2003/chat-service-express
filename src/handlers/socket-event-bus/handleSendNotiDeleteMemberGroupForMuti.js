const handleSendNotiDeleteMemberGroupForMuti = async (message) => {
  console.log("emit delete member from group  .....");
  console.log("message: " + JSON.stringify(message, null, 2));

  message.data.removedUserId.forEach((userId) => {
    global.io.to(userId.toString()).emit("deleteMemberFromGroup", message);
  });

  message.data.oldMemberIds.forEach((userId) => {
    global.io
      .to(userId.toString())
      .emit("deleteMemberFromGroup_updateMemberList", message);
  });

  console.log("emit delete member from group success.....");
};
module.exports = handleSendNotiDeleteMemberGroupForMuti;
