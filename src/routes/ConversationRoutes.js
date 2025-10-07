const express = require("express");
const { User } = require("../models/User");
const { Message, STATUS, REACTION } = require("../models/Message");
const Conversation = require("../models/Conversation");
const UserConversation = require("../models/UserConversation");
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
        content: "ssss",
        type: "text",
      },
    ]);

    console.log("user: ", user);
    console.log("avoidConversationIds: ", avoidConversationIds);

    const userId = user._id;

    try {
      await Statistic.insertMany([
        {
          userId,
          conversations: [
            {
              conversationId: conv._id,
            },
          ],
        },
      ]);
    } catch (error) {
      console.log(error);
    }

    const statistic = await Statistic.findOne({ userId });
    console.log("statistic: ", JSON.stringify(statistic, null, 2));

    // const userConversations = await UserConversation.find({
    //   userId,
    //   status: "active",
    // });
    // console.log("userConversations: ", userConversations);

    const myConversations = statistic.conversations.filter(
      (conversation) => conversation.status !== "invisible"
    );
    console.log("myConversations: ", myConversations);

    const conversations = [];

    for (let i = 0; i < myConversations.length; i++) {
      const conversation = await Conversation.findById(
        myConversations[i].conversationId
      );
      conversations.push(conversation);
    }
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
        // const conversationView = conversationViews[index]._doc;
        return name && conversationViews[index].name.includes(name);
      })
      .map((conversation, index) => {
        const conversationId = conversation._id;
        const conversationDoc = conversation._doc;
        const lastMessage = lastMessages[index];
        const conversationView = conversationViews[index]._doc;
        const lastMessageDate = lastMessage
          ? lastMessage.createdAt
          : conversation.createdAt;

        const countUnreadMessage = statistic.conversations.find((item) =>
          item.conversationId.equals(conversationId)
        ).unreadMessageNums;

        return {
          conversation: {
            ...conversationDoc,
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
    const unreadConversationNums = 9999;
    response.data.unreadConversationNums = unreadConversationNums;
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
