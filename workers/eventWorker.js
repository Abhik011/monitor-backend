const { Worker } = require("bullmq");
const geoip = require("geoip-lite");
const Event = require("../models/Event");

new Worker("events", async job => {

  const data = job.data;

  const geo = geoip.lookup(data.ip);
  const country = geo?.country || "Unknown";

  await Event.create({
    ...data,
    country
  });

});