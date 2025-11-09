const { Noti } = require("../../models/Noti");
const syncNoti = async (message) => {
  console.log("syncing NOTI.....");
  console.log("message: " + JSON.stringify(message, null, 2));
  await Noti.create(message);
};

module.exports = syncNoti;
