const { User } = require("../models/User");
const { Message } = require("../models/Message");
const SocketEventBus = require("../handlers/socket-event-bus");
const {
  getMyConversationByUserIdAndConversationId,
} = require("./getMyConversation");
const mongoose = require("mongoose");
const convertMessageToLongFormat = require("../common/utils/convertMessageToLongFormat");
const convertUserToLongFormat = require("../common/utils/convertUserToLongFormat");

const getDetailConversationById = async (req, res) => {
  try {
    console.log("\nstart-get-detail-conversation\n"); // In ra console server
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
    // console.log("ourConversation: ", JSON.stringify(ourConversation, null, 2));
    // console.log("myConversation: ", JSON.stringify(myConversation, null, 2));

    // Khởi tạo SocketEventBus & emit su kien co nguoi doc tin nhan
    const socketEventBus = await SocketEventBus.getInstance();
    console.log("✅ Socket Event Bus initialized successfully");

    await Promise.all([
      ourConversation.save(),
      socketEventBus.publish(
        "emit_seen_status_for_multi_receiver_in_multi_device",
        {
          user,
          ourConversation,
          myConversation,
        }
      ),
    ]);
    return res.json({
      success: true,
      status: 200,
      message: "Here is your detail conversation",
      data: {
        conversation: {
          _id: ourConversation._id,
          name: myConversation.view.name,
          type: ourConversation.type,
          createdAt: ourConversation.createdAt,
          updatedAt: ourConversation.updatedAt,
          __v: myConversation.__v,
          settings: {
            _id: null,
            userId: user._id,
            conversationId: ourConversation._id,
            getNotifications: myConversation.isReceiveNoti,
            isPinned: false,
            language: myConversation.language,
            translatedTo: myConversation.translatedTo,
            createdAt: ourConversation.createdAt,
            updatedAt: ourConversation.updatedAt,
            __v: ourConversation.__v,
          },
          seenBy: ourConversation.participants.map((participant) => {
            return {
              userId: participant.userId,
              messageId: participant.lastReadOffset,
            };
          }),
          messages: await Promise.all(
            messages
              .slice(skip, Math.min(skip + limit, messages.length))
              .map(async (message) => {
                return await convertMessageToLongFormat(message);
              })
          ),
        },
        users: await Promise.all(
          ourConversation.participants.map((participant) => {
            return convertUserToLongFormat(participant.userId);
          })
        ),
        pagination: {
          currentPage: +currentPage,
          pageSize: +pageSize,
          totalItems: +messages.length,
          totalPages: +Math.ceil(messages.length / pageSize),
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
module.exports = getDetailConversationById;
