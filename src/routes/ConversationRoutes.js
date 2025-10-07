const express = require("express");
const { User } = require("../models/User");
const { Message } = require("../models/Message");
const Conversation = require("../models/Conversation");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const ConversationView = require("../models/ConversationView");
const Statistic = require("../models/Statistic");

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

    console.log("user: ", user);
    console.log("avoidConversationIds: ", avoidConversationIds);

    const userId = user._id;

    const statistic = await Statistic.findOne({ userId });
    console.log("statistic: ", JSON.stringify(statistic, null, 2));

    const myConversations = statistic.conversations.filter(
      (conversation) => conversation.status !== "invisible"
    );
    console.log("myConversations: ", myConversations);

    const conversations = await Conversation.find({
      _id: { $in: myConversations.map((item) => item.conversationId) },
    });
    console.log("conversations: ", conversations);

    const conversationViews = [];

    for (let i = 0; i < myConversations.length; i++) {
      const conversationId = myConversations[i].conversationId;
      const lstViews = await ConversationView.find({
        conversationId,
      });
      if (conversations[i].type === "private") {
        conversationViews.push(
          lstViews.find(
            (conversationView) => !conversationView.refId.equals(userId)
          )
        );
      } else {
        conversationViews.push(lstViews[0]);
      }
    }
    console.log("conversationViews: ", conversationViews);

    const lastMessages = [];
    for (let i = 0; i < myConversations.length; i++) {
      const conversationRaw = myConversations[i];
      const conversationId = conversationRaw.conversationId;
      const skipUntilOffset = conversationRaw.skipUntilOffset;
      console.log("conversationId: ", conversationId);
      console.log("skipUntilOffset: ", skipUntilOffset);

      if (conversationRaw.status === "initial") lastMessages.push(null);
      else if (conversationRaw.status === "running") {
        const lastMessage = await Message.find({
          conversationId,
        })
          .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo thời gian tạo
          .limit(1);
        lastMessages.push(lastMessage[0]);
      }
    }

    console.log("lastMessages: ", lastMessages);

    const allRecord = conversations
      .filter((conversation, index) => {
        return name && !conversationViews[index].name.includes(name)
          ? false
          : true;
      })
      .map((conversation, index) => {
        const conversationId = conversation._id;
        const conversationDoc = conversation._doc;
        const lastMessage = lastMessages[index];
        const conversationView = conversationViews[index]._doc;
        const lastMessageDate = lastMessage
          ? lastMessage.createdAt
          : conversation.createdAt;

        const item = statistic.conversations.find((item) =>
          item.conversationId.equals(conversationId)
        );

        const countUnreadMessage = item.unreadMessageNums;
        const status = item.status; // status in my view

        return {
          conversation: {
            ...conversationDoc,
            status,
            lastMessage,
            conversationView,
            lastMessageDate,
            countUnreadMessage,
          },
        };
      })
      // sắp xếp giảm dần theo lastMessageDate
      .sort(
        (a, b) =>
          b.conversation.lastMessageDate - a.conversation.lastMessageDate
      );
    console.log("allRecord: ", allRecord);
    const total = allRecord.length;
    const limit = +pageSize;
    const offset = +currentPage * +limit;
    const paginatedResults = allRecord.slice(offset, offset + limit);

    const response = createPaginateResponse(
      true,
      200,
      "Here is user's conversation.",
      currentPage,
      pageSize,
      total,
      paginatedResults
    );

    // // Gán biến đếm số conversation chưa đọc
    response.data.unreadConversationNums = statistic.unreadConversationNums;
    // // Tạo kết quả phân trang
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
