const express = require("express");
const router = express.Router();
const geoip = require("geoip-lite");
const crypto = require("crypto");
const Project = require("../models/Project");
const Event = require("../models/Event");
const PLANS = require("../config/plans");
const Organization = require("../models/Organization");
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

  console.log("BODY:", req.body);

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

    const limit = PLANS[org.plan].events;

    if (org.usage.events >= limit) {
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

    let stored = 0;

    for (const body of events) {

      if (!body.type) continue;

      const fingerprint = createFingerprint(body);

      const recent = await Event.findOne({
        projectId: project._id,
        fingerprint,
        ip,
        createdAt: {
          $gt: new Date(Date.now() - 3000)
        }
      });

      if (recent) continue;

      const event = await Event.create({
        ...body,
        projectId: project._id,
        ip,
        country,
        fingerprint
      });

      stored++;

      await Organization.findByIdAndUpdate(
        project.organizationId,
        { $inc: { "usage.events": 1 } }
      );

      if (io) {
        io.emit("new-event", event);
      }

    }

    res.json({ success: true, stored });

  } catch (err) {

    console.error("TRACK ERROR", err);

    res.status(500).json({ success: false });

  }

});
/* -----------------------------
   GET EVENTS
----------------------------- */
router.get("/", async (req, res) => {

  try {

    const {
      type,
      page,
      country,
      limit = 100,
      skip = 0
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (page) query.page = page;
    if (country) query.country = country;

    const events = await Event
      .find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.json({
      total,
      events
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({ success: false });

  }

});
/* -----------------------------
   ERRORS BY COUNTRY
----------------------------- */
router.get("/errors-by-country", async (req, res) => {

  try {

    const data = await Event.aggregate([
      { $match: { type: "error" } },
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(data);

  } catch (err) {

    res.status(500).json({ success: false });

  }

});
/* -----------------------------
   ERROR GROUPS
----------------------------- */
router.get("/error-groups", async (req, res) => {

  try {

    const groups = await Event.aggregate([
      { $match: { type: "error" } },
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

    res.status(500).json({ success: false });

  }

});

module.exports = router;