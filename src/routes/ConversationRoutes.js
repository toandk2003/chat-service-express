const express = require("express");
const getListConversation = require("../services/getListConversation");
const deleteConversation = require("../services/deleteConversation");
const getDetailConversationById = require("../services/getDetailConversationById");
const getDetailConversationByFriend = require("../services/getDetailConversationByFriend");
const getListAttachmentOfConversation = require("../services/getListAttachmentOfConversation");
const updateConversation = require("../services/updateConversation ");
const updateStatusSeenLastMessage = require("../services/updateStatusSeenLastMessage");
const findChatBot = require("../services/findChatBot");
const genTokenBot = require("../services/genTokenBot");

const conversationRoutes = express.Router();

conversationRoutes.get("/conversations/detail", getDetailConversationByFriend);

conversationRoutes.get(
  "/conversations/:id/attachments",
  getListAttachmentOfConversation
);

conversationRoutes.get("/conversations", getListConversation);
conversationRoutes.get("/conversations/findChatBot", findChatBot);
conversationRoutes.post("/conversations/genTokenBot", genTokenBot);
conversationRoutes.get("/conversations/:id", getDetailConversationById);
conversationRoutes.delete("/conversations/:id", deleteConversation);
conversationRoutes.put("/conversations/:conversationId", updateConversation);
conversationRoutes.put(
  "/conversations/:conversationId/change-seen-status",
  updateStatusSeenLastMessage
);

module.exports = conversationRoutes;
