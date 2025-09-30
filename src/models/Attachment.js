const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const AttachmentSchema = new BaseSchema(
  {
    originalFileName: String,
    fileSize: Number,
    bucket: String,
    contentType: String,
    key: String,
    status: {
      type: String,
      enum: ["CONFIRMED", "WAITING_CONFIRM", "DELETED"],
      default: "WAITING_CONFIRM",
    },
  },
  {
    collection: "attachments",
  }
);

const Attachment = mongoose.model("attachments", AttachmentSchema);

module.exports = Attachment;
