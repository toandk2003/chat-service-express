const { User } = require("../../models/User");

const handleSendNotiCreateGroupForMuti = async (message) => {
  console.log("emit createGroup  .....");
  console.log("message: " + JSON.stringify(message, null, 2));

  message.data.users.forEach((item) => {
    const user = item.user;
    const userId = user._id;
    global.io.to(userId.toString()).emit("createGroup", message);
  });
  console.log("emit  createGroup  success.....");
};
module.exports = handleSendNotiCreateGroupForMuti;
