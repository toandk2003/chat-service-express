const handleSendNotiAddMemberGroupForMuti = async (message) => {
  console.log("emit add member to group  .....");
  console.log("message: " + JSON.stringify(message, null, 2));

  message.data.newMemberIds.forEach((userId) => {
    global.io.to(userId.toString()).emit("addMembersToGroup", message);
  });

  message.data.oldMemberIds.forEach((userId) => {
    global.io
      .to(userId.toString())
      .emit("addMembersToGroup_updateMemberList", message);
  });

  console.log("emit  add member to group  success.....");
};
module.exports = handleSendNotiAddMemberGroupForMuti;
