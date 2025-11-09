const { User } = require("../../models/User");

const handleSendNotiReceiveFRForMuti = async (message) => {
  console.log("emit  receiveFriendRequest.....");
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
  global.io.to(senderId.toString()).emit("receiveFriendRequest", message);
  global.io.to(receiverId.toString()).emit("receiveFriendRequest", message);
  console.log("emit  receiveFriendRequest success.....");
};
module.exports = handleSendNotiReceiveFRForMuti;
