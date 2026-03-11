const express = require("express");
const router = express.Router();

const Monitor = require("../models/Monitor");
const MonitorLog = require("../models/MonitorLog");

/*
PUBLIC STATUS PAGE
GET /status/:projectId
*/

router.get("/:projectId", async (req, res) => {

  try {

    const { projectId } = req.params;

    const monitors = await Monitor.find({ projectId });

    const results = [];

    for (const monitor of monitors) {

      const lastLogs = await MonitorLog
        .find({ monitorId: monitor._id })
        .sort({ createdAt: -1 })
        .limit(100);

      const totalChecks = lastLogs.length;

      const upChecks = lastLogs.filter(l => l.status === "up").length;

      const uptime = totalChecks
        ? ((upChecks / totalChecks) * 100).toFixed(2)
        : 100;

      results.push({
        id: monitor._id,
        name: monitor.name,
        url: monitor.url,
        status: monitor.lastStatus,
        responseTime: monitor.lastResponseTime,
        uptime
      });

    }

    res.json({
      success: true,
      projectId,
      services: results
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

module.exports = router;