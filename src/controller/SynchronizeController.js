const Conversation = require("../models/Conversation");

const synchronizeController = {
  syncConversationPrivate: async (req, res) => {
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

    const conversation = await Conversation.create({
      ...req.body,
      name: req.body.participants[0] + "-" + req.body.participants[1],
    });

    res.status(200).json({
      timestamp: new Date().toISOString(),
      success: true,
      data: conversation,
    });
  },
};

module.exports = synchronizeController;
