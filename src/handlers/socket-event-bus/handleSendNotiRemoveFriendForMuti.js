const { User } = require("../../models/User");

const handleSendNotiRemoveFriendForMuti = async (message) => {
  console.log("emit  remove Friend  .....");
  console.log("message: " + JSON.stringify(message, null, 2));

  const senderEmail = message.data.sender.email;
  const receiverEmail = message.data.receiver.email;

  console.log("senderEmail: ", senderEmail);
  console.log("receiverEmail: ", receiverEmail);

  const [sender, receiver] = await Promise.all([
    User.findOne({
      email: senderEmail,
    }),
    User.findOne({
      email: receiverEmail,
    }),
  ]);
  const senderId = sender._id;
  const receiverId = receiver._id;

  global.io.to(senderId.toString()).emit("deleteFriend", message);
  global.io.to(receiverId.toString()).emit("deleteFriend", message);
  console.log("emit  remove Friend success.....");
};
module.exports = handleSendNotiRemoveFriendForMuti;
