const withTransactionThrow = require("../../common/utils/withTransactionThrow");
const Conversation = require("../../models/Conversation");
const { User } = require("../../models/User");

const syncConversation = async (data) => {
  console.log("syncing conversation.....");
  return await withTransactionThrow(async (session, data) => {
    console.log("syncing conversation.....");

    const conversationExists = await Conversation.findOne({
      type: "private",
      $or: [
        { name: data.participants[0] + "-" + data.participants[1] },
        { name: data.participants[1] + "-" + data.participants[0] },
      ],
      status: "active",
    });

    if (conversationExists) {
      console.log("Conversation already exists:", conversationExists);
      return;
    }

    const conversation = (
      await Conversation.create(
        [
          {
            ...data,
            name: data.participants[0] + "-" + data.participants[1],
          },
        ],
        { session }
      )
    )[0];

    console.log(JSON.stringify(conversation, null, 2));
    const user0 = await User.findOne({ userId: data.participants[0] });
    const user1 = await User.findOne({ userId: data.participants[1] });

    user0.conversations = [];
    user1.conversations = [];

    user0.conversations.push(conversation._id);
    user1.conversations.push(conversation._id);
    await user0.save({ session });
    await user1.save({ session });
  }, data);
};

module.exports = syncConversation;
