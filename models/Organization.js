const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: String,
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    plan: {
      type: String,
      enum: ["FREE", "STARTUP", "GROWTH", "BUSINESS"],
      default: "FREE"
    },
    usage: {
      events: { type: Number, default: 0 }
    },
  },
  {
    timestamps: true
  });

module.exports = mongoose.model("Organization", OrganizationSchema);