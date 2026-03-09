const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
{
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    index: true
  },

  type: String,
  message: String,
  api: String,
  status: Number,
  latency: Number,
  page: String,

  ip: String,
  country: String,

  fingerprint: String,

  sessionId: String,
  userId: String,

  userAgent: String,

  metadata: Object
},
{
  timestamps: true
});

/* INDEXES */

EventSchema.index({ projectId: 1, createdAt: -1 });
EventSchema.index({ type: 1 });
EventSchema.index({ fingerprint: 1 });

module.exports = mongoose.model("Event", EventSchema);