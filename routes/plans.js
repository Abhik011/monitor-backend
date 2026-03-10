const express = require("express");
const router = express.Router();

const PLANS = require("../config/plans");

router.get("/", (req,res)=>{
  res.json({ plans: PLANS });
});

module.exports = router;