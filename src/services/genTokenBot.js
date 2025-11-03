const jwt = require("jsonwebtoken");


const genTokenBot = async (req, res) => {
  try {
    console.log("\ngen token bot\n"); // In ra console server

    const payload = { email: "ChatBot@gmail.com" };

    // Ký token (hết hạn sau 1 ngày)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      success: true,
      status: 200,
      message: "Here is token of bot",
      data: {
        token,
      },
    });

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
module.exports = genTokenBot;
