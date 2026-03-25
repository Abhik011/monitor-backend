const express = require("express");
const router = express.Router();
const geoip = require("geoip-lite");
const crypto = require("crypto");

const Project = require("../models/Project");
const Event = require("../models/Event");
const Organization = require("../models/Organization");

const auth = require("../middleware/auth");
const { checkEventLimit } = require("../utils/planAccess");

/* -----------------------------
   CLIENT IP
----------------------------- */

function getClientIP(req) {

  let ip =
    req.headers["cf-connecting-ip"] ||
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    req.ip;

  if (ip && ip.includes("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  return ip;

}

/* -----------------------------
   FINGERPRINT
----------------------------- */

function createFingerprint(body) {

  const base =
    body.type +
    (body.message || "") +
    (body.api || "") +
    (body.page || "");

  return crypto
    .createHash("md5")
    .update(base)
    .digest("hex");

}

/* -----------------------------
   TRACK EVENT
----------------------------- */

router.post("/:apiKey", async (req, res) => {

  try {

    if (typeof req.body === "string") {
      req.body = JSON.parse(req.body);
    }

    const { apiKey } = req.params;

    const project = await Project.findOne({ apiKey });

    if (!project) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const org = await Organization.findById(project.organizationId);

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    /* PLAN LIMIT CHECK */

    if (!checkEventLimit(org)) {
      return res.status(429).json({
        error: "Plan event limit reached",
        upgrade: true
      });
    }

    let events = req.body.events || [req.body];

    if (!Array.isArray(events)) {
      events = [events];
    }

    const ip = getClientIP(req);
    const geo = geoip.lookup(ip);
    const country = geo?.country || "Unknown";

    const io = req.app.get("io");

    let storedEvents = [];

    for (const body of events) {

      if (!body.type) continue;

      const fingerprint = createFingerprint(body);

      const recent = await Event.findOne({
        projectId: project._id,
        fingerprint,
        ip,
        createdAt: { $gt: new Date(Date.now() - 3000) }
      });

      if (recent) continue;

      const event = await Event.create({
        ...body,
        projectId: project._id,
        ip,
        country,
        fingerprint
      });

      storedEvents.push(event);

    }

    /* UPDATE USAGE */

    if (storedEvents.length) {

      await Organization.findByIdAndUpdate(
        project.organizationId,
        { $inc: { "usage.events": storedEvents.length } }
      );

    }

    /* REALTIME SOCKET EVENTS */

    if (io && storedEvents.length) {

      storedEvents.forEach(event => {
        io.emit("new-event", event);
      });

    }

    res.json({
      success: true,
      stored: storedEvents.length
    });

  } catch (err) {

    console.error("TRACK ERROR", err);

    res.status(500).json({
      success: false,
      error: "Tracking failed"
    });

  }

});

/* -----------------------------
   GET EVENTS (PAGINATED)
----------------------------- */

router.get("/", auth, async (req, res) => {

  const { projectId, page = 1, limit = 200, type, country } = req.query;

  if (!projectId) {
    return res.status(400).json({
      error: "Missing projectId"
    });
  }

  const pageNum = Number(page);
  const limitNum = Math.min(Number(limit), 500);

  const query = { projectId };

  if (type) query.type = type;
  if (country) query.country = country;

  try {

    const totalEvents = await Event.countDocuments(query);

    const events = await Event
      .find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({
      totalEvents,
      page: pageNum,
      limit: limitNum,
      events
    });

  } catch (err) {

    console.error("Event fetch error:", err);

    res.status(500).json({
      error: "Server error"
    });

  }

});

/* -----------------------------
   ERRORS BY COUNTRY
----------------------------- */

router.get("/errors-by-country", auth, async (req, res) => {

  try {

    const { projectId } = req.query;

    const data = await Event.aggregate([
      { $match: { type: "error", projectId } },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(data);

  } catch (err) {

    res.status(500).json({
      success: false
    });

  }

});

/* -----------------------------
   ERROR GROUPS
----------------------------- */

router.get("/error-groups", auth, async (req, res) => {

  try {

    const { projectId } = req.query;

    const groups = await Event.aggregate([
      { $match: { type: "error", projectId } },
      {
        $group: {
          _id: "$fingerprint",
          message: { $first: "$message" },
          count: { $sum: 1 },
          lastSeen: { $max: "$createdAt" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json(groups);

  } catch (err) {

    res.status(500).json({
      success: false
    });

  }

});

module.exports = router;