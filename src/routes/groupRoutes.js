const express = require("express");
const createGroup = require("../services/createGroup");
const addMemberToGroup = require("../services/addMemberToGroup");

const groupRoutes = express.Router();
groupRoutes.post("/groups", createGroup);
groupRoutes.put("/groups/:id/add-member", addMemberToGroup);

module.exports = groupRoutes;
