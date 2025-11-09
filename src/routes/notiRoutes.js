const express = require("express");
const getNotification = require("../services/getNotification");

const changeStatusNoti = require("../services/changeStatusNoti");

const notiRoutes = express.Router();

notiRoutes.get("/api/notifications", getNotification);

notiRoutes.put("/api/notifications/:id/status", changeStatusNoti);

module.exports = notiRoutes;
