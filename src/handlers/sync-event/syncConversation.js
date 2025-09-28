const withTransactionThrow = require("../../common/utils/withTransactionThrow");
const Conversation = require("../../models/Conversation");
const { User } = require("../../models/User");
const UserConversation = require("../../models/UserConversation");

const syncConversation = async (data) => {
  console.log("syncing conversation.....");
  return await withTransactionThrow(async (session, data) => {
    console.log("syncing conversation.....");
    const firstUserEmail = data.participants[0];
    const secondUserEmail = data.participants[1];

    const firstUser = User.findOne({ email: firstUserEmail });
    const secondUser = User.findOne({ email: secondUserEmail });
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
      .filter(
        async (conversationId) =>
          (await Conversation.findById(conversationId)).type === "private"
      )
      .map((conversation) => conversation._id);

    const privateConversationOfSecondUser = conversationSecondUserRegist
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

    const [conversation] = await Conversation.insertMany([{}], { session });

    console.log(JSON.stringify(conversation, null, 2));

    await UserConversation.insertMany(
      [
        { userId: firstUser._id_, conversationId: conversation._id },
        { userId: secondUser._id, conversationId: conversation._id },
      ],
      { session }
    );
  }, data);
};

module.exports = syncConversation;
