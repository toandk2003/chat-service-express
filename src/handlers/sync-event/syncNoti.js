const mongoose = require("mongoose");

const syncNoti = async (message) => {
  console.log("syncing NOTI.....");
  console.log("message: " + JSON.stringify(message, null, 2));

  const messageType = message.type;
  console.log(messageType);
};

module.exports = syncNoti;
