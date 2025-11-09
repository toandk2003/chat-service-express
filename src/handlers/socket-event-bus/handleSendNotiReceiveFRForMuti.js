const { User } = require("../../models/User");

const handleSendNotiReceiveFRForMuti = async (message) => {
  console.log("emit  receiveFriendRequest.....");
  console.log("message: " + JSON.stringify(message, null, 2));
  const receiverEmail = message.data.receiver.email;
  console.log("receiverEmail: ", receiverEmail);
  const user = await User.findOne({
    email: receiverEmail,
  });
  const userId = user._id;
  global.io.to(userId.toString()).emit("receiveFriendRequest", message);
};
module.exports = handleSendNotiReceiveFRForMuti;
