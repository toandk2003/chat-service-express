// controllers/HelloController.js
const helloController = {
  // GET /helloworld
  getHelloWorld: (req, res) => {
    try {
      res.status(200).json({
        message: "Hello World!",
        timestamp: new Date().toISOString(),
        success: true
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        success: false
      });
    }
  },

  // POST /helloworld
  postHelloWorld: (req, res) => {
    try {
      const { name } = req.body;
      
      res.status(200).json({
        message: name ? `Hello ${name}!` : "Hello World!",
        timestamp: new Date().toISOString(),
        success: true,
        data: req.body
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        success: false
      });
    }
  }
};

module.exports = helloController;