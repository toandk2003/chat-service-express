const express = require("express");
const getListConversation = require("../services/getListConversation");
const deleteConversation = require("../services/deleteConversation");
const getDetailConversationById = require("../services/getDetailConversationById");
const getDetailConversationByFriend = require("../services/getDetailConversationByFriend");

const conversationRoutes = express.Router();

conversationRoutes.get("/conversations", getListConversation);
conversationRoutes.get("/conversations/detail", getDetailConversationByFriend);
conversationRoutes.get("/conversations/:id", getDetailConversationById);
conversationRoutes.delete("/conversations/:id", deleteConversation);

module.exports = conversationRoutes;
