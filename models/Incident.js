const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({

  monitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Monitor",
    required: true
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  url: String,

  status: {
    type: String,
    default: "open"
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  resolvedAt: {
    type: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("Incident", IncidentSchema);