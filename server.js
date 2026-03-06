const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const trackRoutes = require("./routes/track");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.set("trust proxy", true);
app.use("/track", trackRoutes);

mongoose.connect("mongodb+srv://kulkarniabhijeet1705_db_user:b6F3He5MJKXsW7tU@cluster0.5msartv.mongodb.net/MonitoringDB?appName=Cluster0");

app.listen(4000, () => {
    console.log("Monitoring server running");
});