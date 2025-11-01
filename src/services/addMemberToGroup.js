const { User } = require("../models/User");
const { Message } = require("../models/Message");
const Conversation = require("../models/Conversation");
const mongoose = require("mongoose");
const withTransactionThrow = require("../common/utils/withTransactionThrow");
const {
  getMyConversationByUserIdAndConversationId,
} = require("./getMyConversation");
const convertUserToLongFormat = require("../common/utils/convertUserToLongFormat");
const addMemberToGroup = async (req, res) => {
  return await withTransactionThrow(
    async (session, req, res) => {
      console.log("\nstart-create-group\n"); // In ra console server
      const { memberEmails } = req.body;
      const { id } = req.params;
      const conversationId = new mongoose.Types.ObjectId(id);

      if (!memberEmails.length) {
        throw new Error("memberEmails must be array");
      }

      //TODO remove toLowerCase
      const email = req.currentUser.email;
      console.log("email: " + email);
      const user = await User.findOne({ email, status: "ACTIVE" });
      console.log("user: ", user);
      const userId = user._id;

      const users = await Promise.all(
        memberEmails.map(async (email) => {
          const res = await User.findOne({
            email,
          });

          if (!res) throw new Error("USER NOT FOUND WITH ID: " + memberId);

          return res;
        })
      );

      // get response
      const [ourConversation, myConversation] =
        await getMyConversationByUserIdAndConversationId(
          userId,
          conversationId
        );

      if (!ourConversation || !myConversation)
        throw new Error("CONVERSATION NOT FOUND WITH ID: " + conversationId);

      if (!ourConversation.leaderId.equals(userId)) {
        throw new Error(
          "YOU ARE NOT LEADER OF CONVERSATION WITH ID: " + conversationId
        );
      }

      if (
        ourConversation.currentMember + memberEmails >
        ourConversation.maxMember
      )
        throw new Error(
          "CONVERSATION IS FULL WITH " + ourConversation.maxMember + " members"
        );

      ourConversation.currentMember += memberEmails.length;

      const membersToAdd = users.map((user) => {
        return {
          userId: user._id,
          view: {
            name: myConversation.view.name,
            avatar: users.slice(0, 3).map((user) => {
              return {
                userId: user._id,
                value: user.avatar,
              };
            }),
            bucket: user.bucket,
          },
        };
      });
      ourConversation.participants.add(...membersToAdd);

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

      return res.json({
        success: true,
        status: 200,
        message: "Here is your detail conversation",
        data: {
          conversation: {
            _id: ourConversation._id,
            name: myConversation.view.name,
            status: myConversation.status,
            type: ourConversation.type,
            createdAt: ourConversation.createdAt,
            updatedAt: ourConversation.updatedAt,
            lastMessage: null,
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
          },
          isNewCreated: false,
          messages: [],
          users: await Promise.all(
            ourConversation.participants.map(async (participant) => {
              const res = await convertUserToLongFormat(participant.userId);
              res.isKeyMember = participant.userId.equals(userId);
              return res;
            })
          ),
          pagination: {
            currentPage: 0,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
          },
        },
      });
    },
    req,
    res
  );
};

module.exports = addMemberToGroup;
