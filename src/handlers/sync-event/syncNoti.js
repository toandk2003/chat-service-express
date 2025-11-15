const { Noti } = require("../../models/Noti");
const syncNoti = async (message) => {
  try {
    console.log("syncing NOTI.....");
    console.log("message: " + JSON.stringify(message, null, 2));
    await Noti.create(message);
  } catch (error) {
    log.error(error);
  }
};

module.exports = syncNoti;
