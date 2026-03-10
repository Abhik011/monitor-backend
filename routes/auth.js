const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Organization = require("../models/Organization");
const Project = require("../models/Project")

/* -----------------------------
   SIGNUP
----------------------------- */
router.post("/signup", async (req, res) => {

  try {

    const { email, password, name, organizationName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ error: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      name
    });

    const org = await Organization.create({
      name: organizationName || "Default Org",
      ownerId: user._id
    });

    /* LINK USER TO ORGANIZATION */

    user.organizationId = org._id;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        organizationId: org._id
      },
      process.env.JWT_SECRET || "secret"
    );

    res.json({
      token,
      organizationId: org._id
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({ error: "Signup failed" });

  }

});
/* -----------------------------
   LOGIN
----------------------------- */
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        organizationId: user.organizationId
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // load projects for faster dashboard boot
    const projects = await Project.find({
      organizationId: user.organizationId
    });

    res.json({
      token,
      organizationId: user.organizationId,
      projects
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Login failed" });

  }

});

module.exports = router;