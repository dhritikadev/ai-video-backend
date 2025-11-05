require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const route = require("./Routes/route");

// MongoDB Connection
// mongoose
//   .connect(
//     "mongodb+srv://dhritikaonclickinnovations_db_user:dGj2tJ7w198zYiMq@ai-video.zn7qrtg.mongodb.net/aivideo",
//     {
//       tls: true,
//       tlsInsecure: false,
//       serverSelectionTimeoutMS: 10000,
//     }
//   )
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));
mongoose
  .connect(process.env.MONGODB_URI, {
    tls: true,
    tlsInsecure: false,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded videos as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", route);

const port = 5000;

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
