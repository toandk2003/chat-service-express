const { User } = require("../../models/User");

const handleSendNotiRejectFRForMuti = async (message) => {
  console.log("emit  reject fr  .....");
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

  global.io.to(senderId.toString()).emit("rejectFriendRequest", message);
  global.io.to(receiverId.toString()).emit("rejectFriendRequest", message);
  console.log("emit  reject fr  success.....");
};
module.exports = handleSendNotiRejectFRForMuti;
