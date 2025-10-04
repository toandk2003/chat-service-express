const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const ResumeTokenSchema = new BaseSchema(
  {
    token: {
      type: mongoose.Schema.Types.Mixed, // Resume token có thể là object hoặc string
      required: true,
    },
  },
  {
    collection: "resume_tokens",
  }
);

const ResumeToken = mongoose.model("resume_tokens", ResumeTokenSchema);

module.exports = ResumeToken;
