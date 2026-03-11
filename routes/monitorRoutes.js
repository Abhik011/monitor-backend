const express = require("express");
const router = express.Router();

const Monitor = require("../models/Monitor");

router.post("/", async (req, res) => {

  try {

    const {
      organizationId,
      projectId,
      name,
      url,
      frequency,
      timeout
    } = req.body;

    if (!organizationId || !projectId) {

      return res.status(400).json({
        success: false,
        message: "organizationId and projectId required"
      });

    }

    const monitor = await Monitor.create({

      organizationId,
      projectId,
      name,
      url,
      type: "http",
      frequency: frequency || 60,
      timeout: timeout || 10

    });

    res.json({
      success: true,
      data: monitor
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});
router.get("/:id/logs", async (req, res) => {

  const logs = await MonitorLog
    .find({ monitorId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ data: logs });

});
/*
GET ALL MONITORS
GET /api/monitors
*/

router.get("/", async (req, res) => {

  try {

    const { organizationId, projectId } = req.query;

    const monitors = await Monitor.find({
      organizationId,
      projectId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: monitors.length,
      data: monitors
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

/*
GET SINGLE MONITOR
GET /api/monitors/:id
*/

router.get("/:id", async (req, res) => {

  try {

    const { organizationId, projectId } = req.query;

    const monitor = await Monitor.findOne({
      _id: req.params.id,
      organizationId,
      projectId
    });

    if (!monitor) {

      return res.status(404).json({
        success: false,
        message: "Monitor not found"
      });

    }

    res.json({
      success: true,
      data: monitor
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

router.delete("/:id", async (req, res) => {

  try {

    const { organizationId, projectId } = req.body;

    await Monitor.deleteOne({
      _id: req.params.id,
      organizationId,
      projectId
    });

    res.json({
      success: true,
      message: "Monitor deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});
module.exports = router;