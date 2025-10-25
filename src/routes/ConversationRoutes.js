const express = require("express");
const getListConversation = require("../services/getListConversation");
const deleteConversation = require("../services/deleteConversation");
const getDetailConversationById = require("../services/getDetailConversationById");
const getDetailConversationByFriend = require("../services/getDetailConversationByFriend");
const getListAttachmentOfConversation = require("../services/getListAttachmentOfConversation");
const updateConversation = require("../services/updateConversation ");

const conversationRoutes = express.Router();

conversationRoutes.get(
  "/conversations/detail",
  getDetailConversationByFriend
);

conversationRoutes.get(
  "/conversations/:id/attachments",
  getListAttachmentOfConversation
);

conversationRoutes.get("/conversations", getListConversation);
conversationRoutes.get("/conversations/:id", getDetailConversationById);
conversationRoutes.delete("/conversations/:id", deleteConversation);
conversationRoutes.put("/conversations/:id", updateConversation);

module.exports = conversationRoutes;
