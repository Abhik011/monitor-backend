const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
{
  name: String,

  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },

  apiKey: {
    type: String,
    unique: true
  }
},
{
  timestamps: true
});

module.exports = mongoose.model("Project", ProjectSchema);