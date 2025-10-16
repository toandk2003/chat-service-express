const express = require("express");
const getListConversation = require("../services/getListConversation");
const deleteConversation = require("../services/deleteConversation");

const conversationRoutes = express.Router();

conversationRoutes.get("/conversations", getListConversation);
conversationRoutes.delete("/conversations/:id", deleteConversation);

module.exports = conversationRoutes;
