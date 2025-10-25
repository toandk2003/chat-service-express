const { User } = require("../../models/User");
const genPresignURL = require("../../services/genPresignURL");
const convertUserToLongFormat = async (userId) => {
  const sender = await User.findOne(userId);

  if (!sender) throw new Error("NOT FOUND SENDER WITH ID: ", message.senderId);

  return {
    user: {
      _id: sender._id,
      fullName: sender.fullName,
      email: sender.email,
      profilePic: await genPresignURL(sender.avatar),
    },
  };
};

module.exports = convertUserToLongFormat;
