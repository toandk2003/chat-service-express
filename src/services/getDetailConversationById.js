const { User } = require("../models/User");
const { Message } = require("../models/Message");
const Conversation = require("../models/Conversation");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const {
  getMyConversationByUserIdAndConversationId,
} = require("./getMyConversation");
const mongoose = require("mongoose");

const getDetailConversationById = async (req, res) => {
  try {
    console.log("\nstart-delete-conversation\n"); // In ra console server
    const { id } = req.params;
    const { pageSize, currentPage } = req.query;
    const limit = +pageSize;
    const skip = +currentPage * +limit;

    const conversationId = new mongoose.Types.ObjectId(id);
    console.log("conversationId is : " + conversationId);

    const email = req.currentUser.email;
    console.log("email: " + email);

    const user = await User.findOne({ email, status: "ACTIVE" });
    const userId = user._id;
    console.log("user: ", user);
    if (!user) throw new Error("USER NOT FOUND WITH ID: " + userId);

    const [ourConversation, myConversation] =
      await getMyConversationByUserIdAndConversationId(userId, conversationId);

    if (!myConversation)
      throw new Error("CONVERSATION NOT FOUND WITH ID: " + conversationId);

    const skipUntilOffset = myConversation.skipUntilOffset;
    let messages = [];

    if (myConversation.status === "running") {
      messages = await Message.find({
        _id: {
          $gt: skipUntilOffset,
        },
        conversationId,
        status: "CONFIRMED",
      }).sort({ createdAt: -1 }); // Sắp xếp giảm dần theo thời gian tạo
    }
    console.log("messages: ", messages);

    //update lastReadOffset

    if (messages.length > 0) {
      myConversation.lastReadOffset = messages[0]._id;
    }
    console.log("ourConversation: ", JSON.stringify(ourConversation, null, 2));
    console.log("myConversation: ", JSON.stringify(myConversation, null, 2));

    await ourConversation.save();

    return res.json({
      ...createPaginateResponse(
        true,
        200,
        "Here is your detail conversation",
        currentPage,
        pageSize,
        messages.length,
        messages.slice(skip, Math.min(skip + limit, messages.length))
      ),
      myConversation,
      ourConversation,
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
module.exports = getDetailConversationById;
