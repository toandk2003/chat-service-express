const { User } = require("../models/User");

const userController = {
  create: async (req, res) => {
    console.log("📥 Request Body:");
    console.log(JSON.stringify(req.body, null, 2));
    const newUser = await User.create(req.body);

    res.status(200).json({
      timestamp: new Date().toISOString(),
      success: true,
      data: newUser,
    });
  },
};

module.exports = userController;
