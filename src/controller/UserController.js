const userController = {

  // POST /helloworld
  create: (req, res) => {
    const { id, email } = req.currentUser;
    const{}
    res.status(200).json({
        message: "xinchao: " + id + " email: " + email,
        timestamp: new Date().toISOString(),
        success: true,
        data: req.body
      });
  }
}

module.exports = userController;