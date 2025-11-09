const express = require("express");
const getNotification = require("../services/getNotification");

const notiRoutes = express.Router();

notiRoutes.get("/api/notifications", getNotification);

module.exports = notiRoutes;
