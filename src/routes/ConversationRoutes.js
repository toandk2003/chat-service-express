const express = require("express");
const { User } = require("../models/User");
const { Message, STATUS, REACTION } = require("../models/Message");
const Conversation = require("../models/Conversation");
const UserConversation = require("../models/UserConversation");
const countTotal = require("../common/utils/countTotal");
const queryDocument = require("../common/utils/queryDocument");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const ConversationView = require("../models/ConversationView");

const conversationRoutes = express.Router();

conversationRoutes.get("/conversations", async (req, res) => {
  try {
    console.log("\nstart-get-list-conversation\n"); // In ra console server
    const data = req.query;
    console.log("Data: ", JSON.stringify(data)); // In ra console server
    const { name, pageSize, currentPage, avoidConversationIds } = data;
    const email = req.currentUser.email;
    console.log("email: " + email);

    const user = await User.findOne({ email, status: "ACTIVE" });

    const conv = await Conversation.findOne();

    const fakeUser0 = await User.findOne({
      email: "fakeUser0@gmail.com",
      status: "ACTIVE",
    });

    const fakeUser16 = await User.findOne({
      email: "fakeUser16@gmail.com",
      status: "ACTIVE",
    });

    await Message.insertMany([
      {
        conversationId: conv._id,
        senderId: fakeUser0._id,
        recipients: [
          {
            userId: fakeUser16._id,
            reaction: REACTION.ANGRY,
            reactedAt: new Date(),
          },
        ],
        reaction: REACTION.LIKE,
        reactedAt: new Date(),
        content: "content",
        type: "text",
      },
    ]);

    console.log("user: ", user);
    console.log("avoidConversationIds: ", avoidConversationIds);

    const userId = user._id;

    const userConversations = await UserConversation.find({
      userId,
      status: "active",
    });
    const conversationIds = userConversations.map(
      (userConversation) => userConversation.conversationId
    );

    const conversations = [];

    for (let i = 0; i < conversationIds; i++) {
      const conversation = await Conversation.findById(conversationIds[i]);
      conversations.push(conversation);
    }

    const conversationViews = [];

    for (let i = 0; i < conversationIds; i++) {
      const lstViews = await ConversationView.find({
        conversationId: conversationIds[i],
      });
      if (conversations[i].type === "private") {
        conversationViews.push(
          lstViews.find((conversationView) => conversationView.refId !== userId)
        );
      } else {
        conversationViews.push(lstViews[0]);
      }
    }

    const lastMessages = [];
    for (let i = 0; i < conversationIds; i++) {
      const lastMessage = await Message.find({
        conversationId: conversationIds[i],
      })
        .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo thời gian tạo
        .limit(1);
      lastMessages.push(lastMessage);
    }
    

    // Thực hiện đếm tổng số bản ghi
    // Thêm skip và limit vào pipeline đuser_conversationsể phân trang

    const [total, paginatedResults] = await Promise.all([
      countTotal(UserConversation, pipeline),
      queryDocument(UserConversation, pipeline, pageSize, currentPage),
    ]);

    paginatedResults.forEach(async (userConversation) => {
      const lastMessage = userConversation.lastMessage[0];
      const senderId = lastMessage.senderId;
      const conversationId = userConversation.conversationId;
      console.log("lastMessage: " + JSON.stringify(lastMessage));
      console.log("senderId: " + JSON.stringify(senderId));
      console.log("conversationId: " + JSON.stringify(conversationId));
      console.log("userId: " + JSON.stringify(userId));

      const participant = userConversation.conversation.participants.find(
        (item) => item.userId.equals(userId)
      );
      const countUnreadMessage = participant.unreadMessageNums;
      console.log("countUnreadMessage: " + countUnreadMessage);
      console.log("participant: " + JSON.stringify(participant));

      // Gán biến đếm số tin nhắn chưa đọc
      userConversation.conversation.countUnreadMessage = countUnreadMessage;
    });

    const unreadConversationNums = user.unreadConversationNums;
    console.log("unreadConversationNums: ", unreadConversationNums);

    const response = createPaginateResponse(
      true,
      200,
      "Here is user's conversation.",
      currentPage,
      pageSize,
      total,
      paginatedResults
    );

    // Gán biến đếm số conversation chưa đọc
    response.data.unreadConversationNums = unreadConversationNums;
    // Tạo kết quả phân trang
    return res.json(response);
  } catch (error) {
    console.error(error);

    res.json({
      message: error.message,
      error: error.message,
      success: false,
      status: 500,
    });
  }
});

module.exports = conversationRoutes;
