const { paginateQuery } = require("../common/utils/paginateQuery");
const Conversation = require("../models/Conversation");
const { User } = require("../models/User");

const conversationController = {
  getList: async (req, res) => {
    try {
      const { name, pageSize, currentPage } = req.query;
      const userId = req.currentUser.id;
      console.log("userId: " + userId);
      console.log("req: ", req.query);
      const conditionObject = { userId };

      if (typeof name === "string" && name && name.length <= 255) {
        conditionObject.name = name.trim().toLowerCase();
      }
      console.log("conditionObject: ", conditionObject);

      const options = {
        sort: { createdAt: -1 },
        populate: "conversationIds",
      };

      console.log("options: ", options);

      const data = await paginateQuery(
        User,
        currentPage,
        pageSize,
        conditionObject,
        options
      );

      console.log(JSON.stringify(data, null, 2));

      res.status(200).json({
        message: "Here is your conversation",
        success: true,
        status: 200,
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        success: false,
        status: 500,
      });
    }
  },
};

module.exports = conversationController;
