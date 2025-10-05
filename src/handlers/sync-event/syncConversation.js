const withTransactionThrow = require("../../common/utils/withTransactionThrow");
const Conversation = require("../../models/Conversation");
const ConversationView = require("../../models/ConversationView");
const { User } = require("../../models/User");
const UserConversation = require("../../models/UserConversation");

const syncConversation = async (data) => {
  console.log("syncing conversation.....");
  return await withTransactionThrow(async (session, data) => {
    console.log("syncing conversation.....");
    const firstUserEmail = data.participants[0];
    const secondUserEmail = data.participants[1];

    const [firstUser, secondUser] = await Promise.all([
      User.findOne({ email: firstUserEmail }),
      User.findOne({ email: secondUserEmail }),
    ]);

    if (!firstUser)
      throw new Error("NOT FOUND USER WITH EMAIL: " + firstUserEmail);
    if (!secondUser)
      throw new Error("NOT FOUND USER WITH EMAIL: " + secondUserEmail);

    const conversationFirstUserRegist = await UserConversation.find({
      userId: firstUser._id,
      status: "active",
    });

    const conversationSecondUserRegist = await UserConversation.find({
      userId: secondUser._id,
      status: "active",
    });

    const privateConversationOfFirstUser = conversationFirstUserRegist
      .map((userConversation) => userConversation.conversationId)
      .filter(
        async (conversationId) =>
          (await Conversation.findById(conversationId)).type === "private"
      )
      .map((conversation) => conversation._id);

    const privateConversationOfSecondUser = conversationSecondUserRegist
      .map((userConversation) => userConversation.conversationId)
      .filter(
        async (conversationId) =>
          (await Conversation.findById(conversationId)).type === "private"
      )
      .map((conversation) => conversation._id);

    // Dùng Set để tìm phần tử chung nhanh
    const setSecond = new Set(privateConversationOfSecondUser);
    const commonPrivateConversation = privateConversationOfFirstUser.filter(
      (id) => setSecond.has(id)
    );

    if (commonPrivateConversation.length > 0) {
      console.log(
        "Hai user có chung private conversation:",
        commonPrivateConversation
      );
      return;
    }

    const [conversation] = await Conversation.insertMany(
      [
        {
          participants: [{ userId: firstUser._id }, { userId: secondUser._id }],
        },
      ],
      { session }
    );

    const [firstConversationView, secondConversationView] =
      await ConversationView.insertMany(
        [
          {
            conversationId: conversation._id,
            name: firstUser.fullName,
            refId: firstUser._id,
            avatar: firstUser.avatar,
            bucket: firstUser.bucket,
          },
          {
            conversationId: conversation._id,
            name: secondUser.fullName,
            refId: secondUser._id,
            avatar: secondUser.avatar,
            bucket: secondUser.bucket,
          },
        ],
        { session }
      );

    console.log(JSON.stringify(firstConversationView, null, 2));
    console.log(JSON.stringify(secondConversationView, null, 2));

    await UserConversation.insertMany(
      [
        { userId: firstUser._id, conversationId: conversation._id },
        { userId: secondUser._id, conversationId: conversation._id },
      ],
      { session }
    );
  }, data);
};

module.exports = syncConversation;
