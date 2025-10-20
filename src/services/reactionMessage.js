const { User } = require("../models/User");
const { Message } = require("../models/Message");
const Conversation = require("../models/Conversation");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const {
  getMyConversationByUserIdAndConversationId,
} = require("./getMyConversation");
const mongoose = require("mongoose");

const reactionMessage = async (req, res) => {
  try {
    console.log("\nstart-update-message\n"); // In ra console server
    const { id } = req.params;
    const messageId = new mongoose.Types.ObjectId(id);
    const { reaction } = req.body;
    const email = req.currentUser.email;
    console.log("email: " + email);

    const [user, message] = await Promise.all([
      User.findOne({ email, status: "ACTIVE" }),
      Message.findById(messageId),
    ]);
    
    console.log("user: ", user);
    const userId = user._id;

    const { senderId, recipients } = message;

    if (userId.equals(senderId)) {
      if (message.reaction === reaction) message.reaction = null;
      else message.reaction = reaction;
      message.reactionAt = new Date();
    }

    // not sender
    else {
      const member = recipients.find((recipient) =>
        recipient.userId.equals(userId)
      );
      if (member.reaction === reaction) member.reaction = null;
      else member.reaction = reaction;
      member.reactionAt = new Date();
    }

    await message.save();
    // // Tạo kết quả phân trang
    return res.json({
      success: true,
      status: 200,
      message: "Reaction message successfully",
      data: { ...message._doc },
    });
  } catch (error) {
    console.error(error);
    res.json({
      message: error.message,
      error: error.message,
      success: false,
      status: 500,
    });
  }
};
module.exports = reactionMessage;
