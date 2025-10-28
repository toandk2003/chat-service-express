const express = require("express");
const createGroup = require("../services/createGroup");

const groupRoutes = express.Router();
groupRoutes.post("/groups", createGroup);

module.exports = groupRoutes;
