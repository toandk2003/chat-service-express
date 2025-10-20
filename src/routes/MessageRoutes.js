const express = require("express");
const reactionMessage = require("../services/reactionMessage");

const messageRoutes = express.Router();

messageRoutes.put("/messages/:id/reaction", reactionMessage);

module.exports = messageRoutes;
