const { User } = require("../models/User");
const { Message } = require("../models/Message");
const {
  getMyConversationByUserIdAndPartnerId,
} = require("./getMyConversation");
const convertMessageToLongFormat = require("../common/utils/convertMessageToLongFormat");
const convertUserToLongFormat = require("../common/utils/convertUserToLongFormat");

const getDetailConversationByFriend = async (req, res) => {
  try {
    console.log("\nstart-get-detail-conversation\n"); // In ra console server
    const { partnerEmail } = req.query;
    console.log("partnerEmail is: ", partnerEmail);

    const { pageSize, currentPage } = req.query;
    const limit = +pageSize;
    const skip = +currentPage * +limit;

    const email = req.currentUser.email;
    console.log("email: " + email);

    const [user, partner] = await Promise.all([
      User.findOne({ email, status: "ACTIVE" }),
      User.findOne({
        email: partnerEmail,
        status: "ACTIVE",
      }),
    ]);

    const userId = user._id;
    console.log("user: ", user);
    console.log("partner: ", partner);
    if (!user) throw new Error("USER NOT FOUND WITH ID: " + userId);
    if (!partner) throw new Error("PARTNER NOT FOUND WITH ID: " + partner._id);

    const [ourConversation, myConversation] =
      await getMyConversationByUserIdAndPartnerId(userId, partner._id);

    if (!myConversation)
      throw new Error(
        "CONVERSATION NOT FOUND WITH PARTNER EMAIL: " + partnerEmail
      );

    const conversationId = ourConversation._id;
    console.log("conversationId is : " + conversationId);

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
    const isNewCreated = false;

    if (myConversation.status === "invisible") {
      myConversation.status = "initial";
      isNewCreated = true;
    }
    await ourConversation.save();
    // console.log("ourConversation: ", JSON.stringify(ourConversation, null, 2));
    // console.log("myConversation: ", JSON.stringify(myConversation, null, 2));

    // Khởi tạo SocketEventBus & emit su kien co nguoi doc tin nhan

    const keyMemberIds = ourConversation.participants
      .filter((participant) =>
        participant.userId.equals(ourConversation.leaderId)
      )
      .map((participant) => participant.userId);
    const keyMemberId = keyMemberIds.length > 0 ? keyMemberIds[0] : null;

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
        },
        messages: await Promise.all(
          messages
            .slice(skip, Math.min(skip + limit, messages.length))
            .map(async (message) => {
              return await convertMessageToLongFormat(message);
            })
        ),
        users: await Promise.all(
          ourConversation.participants.map(async (participant) => {
            const res = await convertUserToLongFormat(participant.userId);
            res.isKeyMember = participant.userId.equals(keyMemberId);
            return res;
          })
        ),
        isNewCreated,
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
module.exports = getDetailConversationByFriend;
