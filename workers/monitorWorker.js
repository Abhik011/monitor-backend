require("dotenv").config();

const mongoose = require("mongoose");
const axios = require("axios");

const Monitor = require("../models/Monitor");
const MonitorLog = require("../models/MonitorLog");
const Incident = require("../models/Incident");

const { sendAlert } = require("../services/alertService");

async function startWorker() {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Worker connected to MongoDB");
    console.log("🔍 Monitor worker started...");

    setInterval(runChecks, 60000);

  } catch (err) {

    console.error("MongoDB connection error:", err);

  }
}

async function runChecks() {

  const monitors = await Monitor.find({ status: "active" });

  console.log(`Checking ${monitors.length} monitors`);

  for (const monitor of monitors) {

    const start = Date.now();

    try {

      const response = await axios.get(monitor.url, {
        timeout: monitor.timeout * 1000
      });

      const responseTime = Date.now() - start;
      const status = response.status < 400 ? "up" : "down";

      await MonitorLog.create({
        monitorId: monitor._id,
        status,
        responseTime,
        statusCode: response.status,
        location: "india"
      });

      // If site recovered from incident
      if (monitor.alertSent) {

        await Incident.findOneAndUpdate(
          {
            monitorId: monitor._id,
            status: "open"
          },
          {
            status: "resolved",
            resolvedAt: new Date()
          }
        );

      }

      await Monitor.updateOne(
        { _id: monitor._id },
        {
          lastStatus: status,
          lastResponseTime: responseTime,
          lastCheckedAt: new Date(),
          failureCount: 0,
          alertSent: false
        }
      );

      console.log(`✅ ${monitor.url} UP (${responseTime}ms)`);

    } catch (error) {

      const updatedFailureCount = (monitor.failureCount || 0) + 1;

      await MonitorLog.create({
        monitorId: monitor._id,
        status: "down",
        responseTime: 0,
        statusCode: 0,
        location: "india"
      });

      await Monitor.updateOne(
        { _id: monitor._id },
        {
          lastStatus: "down",
          lastResponseTime: 0,
          lastCheckedAt: new Date(),
          failureCount: updatedFailureCount
        }
      );

      if (updatedFailureCount >= 3 && !monitor.alertSent) {

        console.log(`🚨 ALERT: ${monitor.url} is DOWN`);

        // send notifications
        await sendAlert(monitor.url);

        // create incident
        await Incident.create({
          monitorId: monitor._id,
          projectId: monitor.projectId,
          organizationId: monitor.organizationId,
          url: monitor.url
        });

        await Monitor.updateOne(
          { _id: monitor._id },
          { alertSent: true }
        );

      }

      console.log(`❌ ${monitor.url} DOWN`);

    }

  }

}

startWorker();