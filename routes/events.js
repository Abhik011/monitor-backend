const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {

  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: "Missing projectId" });
  }

  const events = await Event
    .find({ projectId })
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ events });

});

module.exports = router;