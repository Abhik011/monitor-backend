const express = require("express");
const router = express.Router();

const SiteEvent = require("../models/SiteEvent");

/* GET EVENTS */

router.get("/", async (req,res)=>{

  const events = await SiteEvent.find().sort({ date: 1 });

  res.json(events);

});

module.exports = router;