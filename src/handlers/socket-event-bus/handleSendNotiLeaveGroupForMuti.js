const handleSendNotiLeaveGroupForMuti = async (message) => {
  console.log("emit leave from group  .....");
  console.log("message: " + JSON.stringify(message, null, 2));

  message.data.userLeaveGroupId.forEach((userId) => {
    global.io.to(userId.toString()).emit("leaveGroup", message);
  });

  message.data.remainMemberIds.forEach((userId) => {
    global.io
      .to(userId.toString())
      .emit("leaveGroup_updateMemberList", message);
  });

  console.log("emit leave from group success.....");
};
module.exports = handleSendNotiLeaveGroupForMuti;
