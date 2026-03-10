const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true
    },

    password: String,

    name: String,
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization"
    }
  },
  {
    timestamps: true
  });

module.exports = mongoose.model("User", UserSchema);