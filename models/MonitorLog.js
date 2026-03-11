const mongoose = require("mongoose");

const MonitorLogSchema = new mongoose.Schema({

  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Monitor"
  },

  status: String,

  responseTime: Number,

  statusCode: Number,

  location: String

}, { timestamps: true });

module.exports = mongoose.model("MonitorLog", MonitorLogSchema);