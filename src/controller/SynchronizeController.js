const withTransaction = require("../common/utils/withTransaction");
const Conversation = require("../models/Conversation");
const { User } = require("../models/User");

const synchronizeController = {
  syncConversationPrivate: async (req, res) => {
    return await withTransaction(
      async (session, req, res) => {
        
        console.log("📥 Request Body:");
        console.log(JSON.stringify(req.body, null, 2));

        const conversationExists = await Conversation.findOne({
          type: "private",
          $or: [
            { name: req.body.participants[0] + "-" + req.body.participants[1] },
            { name: req.body.participants[1] + "-" + req.body.participants[0] },
          ],
          status: "active",
        });

        if (conversationExists) {
          console.log("Conversation already exists:", conversationExists);
          return res.status(200).json({});
        }

        const conversation = (await Conversation.create(
          [
            {
              ...req.body,
              name: req.body.participants[0] + "-" + req.body.participants[1],
            },
          ],
          { session }
        ))[0];

        console.log(JSON.stringify(conversation, null, 2));
        const user0 = await User.findOne({ userId: req.body.participants[0] });
        const user1 = await User.findOne({ userId: req.body.participants[1] });

        console.log("user0", user0);
        console.log("user1", user1);

        user0.conversations = [];
        user1.conversations = [];

        user0.conversations.push(conversation._id);
        user1.conversations.push(conversation._id);
        await user0.save({ session });
        await user1.save({ session });

        res.status(200).json({
          timestamp: new Date().toISOString(),
          success: true,
          data: conversation,
        });
      },
      req,
      res
    );
  },

  syncConversationBot: async (req, res) => {
    console.log("📥 Request Body:");
    console.log(JSON.stringify(req.body, null, 2));

    const conversation = await Conversation.create(req.body);

    const user = User.findOne({ userId: req.currentUser.id });

    console.log("user", user);

    user.conversations = [];
    user.conversations.push(conversation._id);

    await user.save();

    res.status(200).json({
      timestamp: new Date().toISOString(),
      success: true,
      data: conversation,
    });
  },
};

module.exports = synchronizeController;
