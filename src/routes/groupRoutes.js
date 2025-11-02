const express = require("express");
const createGroup = require("../services/createGroup");
const addMemberToGroup = require("../services/addMemberToGroup");
const removeMemberToGroup = require("../services/removeMemberToGroup copy");
const leaveGroup = require("../services/leaveGroup");

const groupRoutes = express.Router();
groupRoutes.post("/groups", createGroup);
groupRoutes.put("/groups/:id/add-member", addMemberToGroup);
groupRoutes.delete("/groups/:id/delete-member", removeMemberToGroup);
groupRoutes.delete("/groups/:id/leave-group", leaveGroup);

module.exports = groupRoutes;
