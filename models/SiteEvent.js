const mongoose = require("mongoose");

const SiteEventSchema = new mongoose.Schema({
  title: String,
  slug: String,
  date: Date,
  location: String,
  image: String,
  description: String
});

module.exports = mongoose.model("SiteEvent", SiteEventSchema);