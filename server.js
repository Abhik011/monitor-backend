require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const path = require("path");

const trackRoutes = require("./routes/track");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const eventRoutes = require("./routes/events");
const organizations = require("./routes/organizations")
const plansRoutes = require("./routes/plans");
const billingRoutes = require("./routes/billing");
const monitorRoutes = require("./routes/monitorRoutes");
const statusRoutes = require("./routes/statusRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const siteEvents = require("./routes/siteEvents");


const app = express();
const server = http.createServer(app);

/* -----------------------------
   STATIC SDK FILE
----------------------------- */

app.use("/data", express.static(path.join(__dirname, "data")));

/* -----------------------------
   SOCKET.IO
----------------------------- */

const io = new Server(server, {
   cors: {
      origin: "*",
      methods: ["GET", "POST"]
   },
   transports: ["websocket", "polling"]
});

app.set("io", io);

/* -----------------------------
   ALLOW ALL ORIGINS (NO CORS LIMIT)
----------------------------- */

app.use((req, res, next) => {

   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

   if (req.method === "OPTIONS") {
      return res.sendStatus(200);
   }

   next();

});

/* -----------------------------
   BODY PARSERS
----------------------------- */

/* JSON requests */

app.use(express.json({ limit: "100kb" }));

/* Needed for sendBeacon */

app.use(express.text({ type: "*/*" }));

/* -----------------------------
   SECURITY
----------------------------- */

app.use(
   helmet({
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false
   })
);

/* -----------------------------
   PERFORMANCE
----------------------------- */

app.use(compression());

/* -----------------------------
   RATE LIMIT
----------------------------- */

const limiter = rateLimit({
   windowMs: 60 * 1000,
   max: 2000
});

/* -----------------------------
   ROUTES
----------------------------- */


app.use("/api/incidents", incidentRoutes);
app.use("/status", statusRoutes);
app.use("/api/monitors", monitorRoutes);
app.use("/billing", billingRoutes);
app.use("/plans", plansRoutes);
app.use("/track", limiter, trackRoutes);
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/events", eventRoutes);
app.use("/organizations", organizations);
app.use("/api/site-events", siteEvents);
/* -----------------------------
   DATABASE
----------------------------- */

mongoose
   .connect(process.env.MONGO_URI)
   .then(() => console.log("✅ MongoDB connected"))
   .catch((err) => console.error("❌ MongoDB connection error:", err));

/* -----------------------------
   SOCKET CONNECTION
----------------------------- */

io.on("connection", (socket) => {
   console.log("📡 Dashboard connected:", socket.id);
});

/* -----------------------------
   START SERVER
----------------------------- */
require("./workers/monitorWorker");
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
   console.log(`🚀 Monitoring server running on port ${PORT}`);
});