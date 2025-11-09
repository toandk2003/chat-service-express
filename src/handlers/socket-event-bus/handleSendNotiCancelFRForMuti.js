const { User } = require("../../models/User");

const handleSendNotiCancelFRForMuti = async (message) => {
  console.log("emit  cancelFriendRequest FR .....");
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

  global.io.to(senderId.toString()).emit("cancelFriendRequest", message);
  global.io.to(receiverId.toString()).emit("cancelFriendRequest", message);
  console.log("emit  cancelFriendRequest success.....");
};
module.exports = handleSendNotiCancelFRForMuti;
