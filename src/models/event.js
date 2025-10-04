const mongoose = require("mongoose");
const BaseSchema = require("./base/BaseSchema.js");

const EventSchema = new BaseSchema(
  {
    payload: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    destination: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "events",
  }
);

const Event = mongoose.model("events", EventSchema);

module.exports = Event;
