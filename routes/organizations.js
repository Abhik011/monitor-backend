const express = require("express");
const router = express.Router();

const Organization = require("../models/Organization");

/* GET ORGANIZATION BY ID */

router.get("/:id", async (req, res) => {

  try {

    const org = await Organization.findById(req.params.id);

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(org);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Failed to fetch organization" });

  }

});

module.exports = router;