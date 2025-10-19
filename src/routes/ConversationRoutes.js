const express = require("express");
const getListConversation = require("../services/getListConversation");
const deleteConversation = require("../services/deleteConversation");
const getDetailConversationById = require("../services/getDetailConversationById");
const getDetailConversationByFriend = require("../services/getDetailConversationByFriend");
const getListAttachmentOfConversation = require("../services/getListAttachmentOfConversation");

const conversationRoutes = express.Router();

conversationRoutes.get(
  "/conversations/view-friend",
  getDetailConversationByFriend
);

conversationRoutes.get(
  "/conversations/:id/attachments",
  getListAttachmentOfConversation
);

conversationRoutes.get("/conversations", getListConversation);
conversationRoutes.get("/conversations/:id", getDetailConversationById);
conversationRoutes.delete("/conversations/:id", deleteConversation);

module.exports = conversationRoutes;
