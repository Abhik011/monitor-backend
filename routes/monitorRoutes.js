const express = require("express");
const router = express.Router();

const Monitor = require("../models/Monitor");
const MonitorLog = require("../models/MonitorLog");
const Organization = require("../models/Organization");

const { checkMonitorLimit } = require("../utils/planAccess");

/*
CREATE MONITOR
*/

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

    const org = await Organization.findById(organizationId);

    const monitorCount = await Monitor.countDocuments({
      organizationId,
      projectId
    });

    if (!checkMonitorLimit(org.plan, monitorCount)) {

      return res.status(403).json({
        success: false,
        message: "Monitor limit reached for your plan"
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

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

/*
GET ALL MONITORS
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

/*
GET MONITOR LOGS
*/

router.get("/:id/logs", async (req, res) => {

  try {

    const logs = await MonitorLog
      .find({ monitorId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ data: logs });

  } catch (err) {

    res.status(500).json({ error: "Failed to fetch logs" });

  }

});

/*
DELETE MONITOR
*/

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