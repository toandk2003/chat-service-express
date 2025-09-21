const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const TestSchema = new BaseSchema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { collection: "Tests" }
);

const Test = mongoose.model("Tests", TestSchema);

module.exports = Test;
