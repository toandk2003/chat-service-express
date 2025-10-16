const { User } = require("../../models/User");
const withTransactionThrow = require("../../common/utils/withTransactionThrow");
const {
  getOtherConversationByUserIdAndConversationId,
} = require("../../services/getMyConversation");

const syncUpdateUser = async (data) => {
  return await withTransactionThrow(async (session, data) => {
    console.log("syncing update user.....");
    const {
      email,
      bio,
      location,
      learningLanguageId,
      nativeLanguageId,
      avatar,
      bucket,
      rowVersion,
    } = data;

    const user = await User.findOne({
      email: data.email,
    });

    if (!user) {
      console.log("User do not exists with email: ", email);
      return;
    }

    Object.assign(user, data);

    await user.save({ session });
    const userId = user._id;
    console.log("user after update: ", JSON.stringify(user, null, 2));

    const promises = user.conversations.map(async (conversation) => {
      const [ourConversation, otherConversations] =
        await getOtherConversationByUserIdAndConversationId(
          userId,
          conversation._id
        );
      otherConversations.forEach((otherConversation) => {
        otherConversation.view.avatar.find((item) =>
          item.userId.equals(userId)
        ).value = avatar;
      });
      await ourConversation.save({ session });
    });
    await Promise.all(promises);
  }, data);
};

module.exports = syncUpdateUser;
