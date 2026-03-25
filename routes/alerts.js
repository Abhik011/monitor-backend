const express = require("express");
const router = express.Router();

const Organization = require("../models/Organization");
const auth = require("../middleware/auth");

const { hasFeature } = require("../utils/planAccess");

router.post("/create", auth, async (req,res)=>{

  try{

    const org = await Organization.findById(req.user.organizationId);

    /* CHECK FEATURE ACCESS */

    if(!hasFeature(org.plan,"ALERTS")){
      return res.status(403).json({
        error:"Upgrade your plan to use alerts"
      });
    }

    /* create alert logic */

    res.json({ success:true });

  }catch(err){

    console.error(err);
    res.status(500).json({ error:"Alert creation failed" });

  }

});

module.exports = router;