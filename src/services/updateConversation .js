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
    const { conversationId } = req.params;
    const { getNotifications, language, translatedTo } = req.body;
    const convId = new mongoose.Types.ObjectId(conversationId);
    const email = req.currentUser.email;
    console.log("email: " + email);

    const user = await User.findOne({ email, status: "ACTIVE" });

    console.log("user: ", user);

    const userId = user._id;
    const [ourConversation, myConversation] =
      await getMyConversationByUserIdAndConversationId(userId, convId);

    console.log("myConversation: ", myConversation);

    if (getNotifications === true || getNotifications === false) {
      myConversation.isReceiveNoti = getNotifications;
    }

    if (language !== null && language !== undefined) {
      myConversation.language = language;
    }

    if (translatedTo !== null && translatedTo !== undefined) {
      myConversation.translatedTo = translatedTo;
    }

    await ourConversation.save();
    // // Tạo kết quả phân trang
    return res.json({
      success: true,
      status: 200,
      message: "",
      data: {
        conversation: {
          _id: ourConversation._id,
          settings: {
            _id: ourConversation._id,
            userId: user._id,
            conversationId: ourConversation._id,
            getNotifications: myConversation.isReceiveNoti,
            isPinned: false,
            language: myConversation.language,
            translateTo: myConversation.translatedTo,
            createdAt: ourConversation.createdAt,
            updatedAt: ourConversation.updatedAt,
            __v: ourConversation.__v,
          },
        },
      },
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
