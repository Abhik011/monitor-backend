const express = require("express");
const router = express.Router();

const Organization = require("../models/Organization");
const auth = require("../middleware/auth");
const VALID_PLANS = ["FREE","STARTUP","GROWTH","BUSINESS"];
const PLANS = require("../config/plans");
const razorpay = require("../config/razorpay");

/* -----------------------------
   GET USAGE
----------------------------- */

router.get("/usage", auth, async (req,res)=>{

  try{

    const org = await Organization.findById(req.user.organizationId);

    if(!org){
      return res.status(404).json({error:"Organization not found"});
    }

    const plan = PLANS[org.plan];

    const used = org.usage.events;
    const limit = plan.events;

    const percent = Math.min(
      Math.round((used / limit) * 100),
      100
    );

    res.json({
      plan: org.plan,
      used,
      limit,
      percent
    });

  }catch(err){

    console.error(err);
    res.status(500).json({error:"Failed to fetch usage"});

  }

});

router.post("/create-order", auth, async (req,res)=>{

  try{

    const { plan } = req.body;

    const prices = {
      STARTUP: 499,
      GROWTH: 1999,
      BUSINESS: 6999
    };

    const amount = prices[plan];

    if(!amount){
      return res.status(400).json({error:"Invalid plan"});
    }

    const order = await razorpay.orders.create({

      amount: amount * 100, // paise
      currency: "INR",
      receipt: "upgrade_" + Date.now()

    });

    res.json({
      orderId: order.id,
      amount,
      plan
    });

  }catch(err){

    console.error(err);
    res.status(500).json({error:"Order creation failed"});

  }

});

router.post("/upgrade", auth, async (req,res)=>{

  try{

    const { plan } = req.body;

    if(!VALID_PLANS.includes(plan)){
      return res.status(400).json({error:"Invalid plan"});
    }

    const org = await Organization.findByIdAndUpdate(
      req.user.organizationId,
      { plan },
      { new:true }
    );

    res.json({
      success:true,
      plan: org.plan
    });

  }catch(err){

    console.error(err);
    res.status(500).json({error:"Upgrade failed"});

  }

});

module.exports = router;