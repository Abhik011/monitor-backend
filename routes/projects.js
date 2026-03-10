const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Project = require("../models/Project");
const auth = require("../middleware/auth");

/* GENERATE API KEY */

function generateApiKey() {
  return "MC_LIVE_" + crypto.randomBytes(16).toString("hex");
}

/* CREATE PROJECT */

router.post("/", auth, async (req, res) => {

  try {

    const { name, organizationId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }

    const apiKey = generateApiKey();

    const project = await Project.create({
      name,
      organizationId,
      apiKey
    });

    res.json({
      projectId: project._id,
      apiKey
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Project creation failed" });

  }

});

/* GET PROJECTS */

router.get("/", auth, async (req, res) => {

  try {

    const organizationId = req.query.organizationId;

    if (!organizationId) {
      return res.status(400).json({ error: "organizationId required" });
    }

    const projects = await Project.find({ organizationId });

    res.json({ projects });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });

  }

});

module.exports = router;