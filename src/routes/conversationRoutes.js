const express = require("express");
const conversationController = require("../controller/ConversationController");
const conversationRoutes = express.Router();

conversationRoutes.get("/conversations", conversationController.getList);

module.exports = conversationRoutes;
