const withTransactionThrow = require("../../common/utils/withTransactionThrow");
const Conversation = require("../../models/Conversation");
const { User } = require("../../models/User");

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

    const [conversation] = await Conversation.insertMany(
      [
        {
          participants: [
            {
              userId: firstUser._id,
              view: {
                name: firstUser.fullName,
                avatar: [firstUser.avatar],
                bucket: [firstUser.bucket],
              },
            },
            {
              userId: secondUser._id,
              view: {
                name: secondUser.fullName,
                avatar: [secondUser.avatar],
                bucket: [secondUser.bucket],
              },
            },
          ],
        },
      ],
      { session }
    );

    firstUser.conversations.push({ _id: conversation._id });
    secondUser.conversations.push({ _id: conversation._id });

    await Promise.all([firstUser.save(), secondUser.save()]);
  }, data);
};

module.exports = syncConversation;
