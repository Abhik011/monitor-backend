const express = require("express");
const router = express.Router();
const geoip = require("geoip-lite");

const Event = require("../models/Event");

router.post("/", async (req, res) => {

  try {

    /* -----------------------------
       GET REAL CLIENT IP
    ----------------------------- */

    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      req.ip;

    // remove IPv6 prefix
    if (ip && ip.includes("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }

    /* -----------------------------
       GEO LOOKUP
    ----------------------------- */

    const geo = geoip.lookup(ip);

    const country = geo?.country || "Unknown";

    /* -----------------------------
       PREVENT DUPLICATE EVENTS
    ----------------------------- */

    const recent = await Event.findOne({
      type: req.body.type,
      page: req.body.page,
      ip,
      createdAt: { $gt: new Date(Date.now() - 3000) }
    });

    if (recent) {
      return res.json({ skipped: true });
    }

    /* -----------------------------
       SAVE EVENT
    ----------------------------- */

    const event = await Event.create({
      ...req.body,
      ip,
      country
    });

    /* -----------------------------
       SERVER LOGGING
    ----------------------------- */

    if (req.body.type === "error") {

      console.log("\n🚨 ERROR");
      console.log(req.body.message);
      console.log(req.body.page);
      console.log("Country:", country);

    }

    if (req.body.type === "api" && req.body.latency > 2000) {

      console.log("\n🐢 SLOW API");
      console.log(req.body.api);
      console.log(req.body.latency + "ms");

    }

    if (req.body.type === "api_error") {

      console.log("\n❌ API ERROR");
      console.log(req.body.api);
      console.log(req.body.message);

    }

    res.json({ success: true });

  } catch (err) {

    console.error("TRACK ERROR", err);

    res.status(500).json({ success: false });

  }

});


/* GET EVENTS */

router.get("/", async (req, res) => {

  try {

    const { type } = req.query;

    const query = type ? { type } : {};

    const events = await Event
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(events);

  } catch (err) {

    console.error("FETCH ERROR", err);

    res.status(500).json({ success: false });

  }

});

module.exports = router;