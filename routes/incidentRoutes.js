const express = require("express");
const router = express.Router();

const Incident = require("../models/Incident");

/*
GET INCIDENTS BY PROJECT
*/

router.get("/:projectId", async (req, res) => {

  try {

    const incidents = await Incident
      .find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: incidents
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

module.exports = router;