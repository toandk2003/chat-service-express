const { User } = require("../models/User");
const Conversation = require("../models/Conversation");
const withTransactionThrow = require("../common/utils/withTransactionThrow");
const getDetailConversationById = require("./getDetailConversationById");
const { getMyConversationByLeaderId } = require("./getMyConversation");
const findChatBot = async (req, res) => {
  try {
    console.log("\nstart-find chat bot\n"); // In ra console server

    const email = req.currentUser.email;
    console.log("email: " + email);
    const user = await User.findOne({ email, status: "ACTIVE" });
    console.log("user: ", user);

    const userId = user._id;

    const [ourConversation, myConversation] = await getMyConversationByLeaderId(
      userId
    );

    let isNewCreated = false;

    if (!ourConversation) {
      await withTransactionThrow(async (session, data) => {
        console.log("creating bot conversation.....");
        const secondUserEmail = "ChatBot@gmail.com";
        const secondUser = await User.findOne({ email: secondUserEmail });

        if (!user) throw new Error("NOT FOUND USER WITH EMAIL: " + email);
        if (!secondUser)
          throw new Error("NOT FOUND USER WITH EMAIL: " + secondUserEmail);

        const [conversation] = await Conversation.insertMany(
          [
            {
              type: "bot",
              leaderId: user._id,
              participants: [
                {
                  userId: user._id,
                  view: {
                    name: secondUser.fullName,
                    avatar: [
                      {
                        userId: secondUser._id,
                        value: secondUser.avatar,
                      },
                    ],
                    bucket: secondUser.bucket,
                  },
                },
                {
                  userId: secondUser._id,
                  view: {
                    name: user.fullName,
                    avatar: [
                      {
                        userId: user._id,
                        value: user.avatar,
                      },
                    ],
                    bucket: user.bucket,
                  },
                },
              ],
            },
          ],
          { session }
        );

        user.conversations.push({ _id: conversation._id });
        secondUser.conversations.push({ _id: conversation._id });

        await Promise.all([
          user.save({ session }),
          secondUser.save({ session }),
        ]);
        isNewCreated = true;
        ourConversation = conversation;
      });
    } else {
      if (myConversation.status === "invisible") {
        myConversation.status = "initial";
        isNewCreated = true;
        await ourConversation.save();
      }
    }
    req.params.id = ourConversation._id.toString();
    const response = await getDetailConversationById(req, res, isNewCreated);
    // response.data.isNewCreated = isNewCreated;

    // return response;
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
module.exports = findChatBot;
