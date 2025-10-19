const { User } = require("../models/User");
const { Message } = require("../models/Message");
const Conversation = require("../models/Conversation");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const {
  getMyConversationByUserIdAndConversationId,
} = require("./getMyConversation");
const mongoose = require("mongoose");

const updateConversation = async (req, res) => {
  try {
    console.log("\nstart-update-conversation\n"); // In ra console server
    const { id } = req.params;
    const { isReceiveNoti } = req.body;
    const conversationId = new mongoose.Types.ObjectId(id);
    const email = req.currentUser.email;
    console.log("email: " + email);

    const user = await User.findOne({ email, status: "ACTIVE" });

    console.log("user: ", user);

    const userId = user._id;
    const [ourConversation, myConversation] =
      await getMyConversationByUserIdAndConversationId(userId, conversationId);

    console.log("myConversation: ", myConversation);

    if (isReceiveNoti === true || isReceiveNoti === false) {
      myConversation.isReceiveNoti = isReceiveNoti;
    }

    await ourConversation.save();
    // // Tạo kết quả phân trang
    return res.json({
      success: true,
      status: 200,
      message: "Update conversation successfully",
      conversation: { ...ourConversation._doc },
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
module.exports = updateConversation;
