const express = require("express");
const router = express.Router();

const Incident = require("../models/Incident");
const auth = require("../middleware/auth");

/*
GET INCIDENTS BY PROJECT
*/

router.get("/:projectId", auth, async (req, res) => {

  try {

    const { projectId } = req.params;

    const incidents = await Incident
      .find({ projectId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: incidents.length,
      data: incidents
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

module.exports = router;