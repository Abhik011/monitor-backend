const mongoose = require("mongoose");

const MonitorSchema = new mongoose.Schema({

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true
    },

    url: {
        type: String,
        required: true
    },

    type: {
        type: String,
        default: "http"
    },

    frequency: {
        type: Number,
        default: 60
    },

    timeout: {
        type: Number,
        default: 10
    },

    status: {
        type: String,
        default: "active"
    },
    lastStatus: {
        type: String,
        default: "unknown"
    },

    lastResponseTime: {
        type: Number,
        default: 0
    },

    lastCheckedAt: {
        type: Date
    },
  failureCount: {
        type: Number,
        default: 0
    },

    alertSent: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("Monitor", MonitorSchema);