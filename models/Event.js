const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({

  type: String,
  message: String,
  api: String,
  status: Number,
  latency: Number,
  page: String,
  url: String,
  ip: String,
  country: String,
  userAgent: String

}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);