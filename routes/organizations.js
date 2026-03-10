const express = require("express");
const router = express.Router();

const Organization = require("../models/Organization");
const auth = require("../middleware/auth");

router.get("/organizations/:id", auth, async (req,res)=>{

  const org = await Organization.findById(req.params.id);

  res.json(org);

});