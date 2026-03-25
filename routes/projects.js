const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Project = require("../models/Project");
const Organization = require("../models/Organization");

const auth = require("../middleware/auth");
const { checkProjectLimit } = require("../utils/planAccess");

/* GENERATE API KEY */

function generateApiKey() {
  return "MC_LIVE_" + crypto.randomBytes(16).toString("hex");
}

/* -----------------------------
   CREATE PROJECT
----------------------------- */

router.post("/", auth, async (req, res) => {

  try {

    const { name, organizationId } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Name required"
      });
    }

    const org = await Organization.findById(organizationId);

    if (!org) {
      return res.status(404).json({
        error: "Organization not found"
      });
    }

    /* COUNT CURRENT PROJECTS */

    const projectCount = await Project.countDocuments({
      organizationId
    });

    /* PLAN LIMIT CHECK */

    if (!checkProjectLimit(org.plan, projectCount)) {

      return res.status(403).json({
        error: "Project limit reached for your plan",
        upgrade: true
      });

    }

    const apiKey = generateApiKey();

    const project = await Project.create({
      name,
      organizationId,
      apiKey
    });

    res.json({
      success: true,
      projectId: project._id,
      apiKey
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Project creation failed"
    });

  }

});

/* -----------------------------
   GET PROJECTS
----------------------------- */

router.get("/", auth, async (req, res) => {

  try {

    const organizationId = req.query.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        error: "organizationId required"
      });
    }

    const projects = await Project.find({ organizationId });

    res.json({
      projects
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to fetch projects"
    });

  }

});

module.exports = router;