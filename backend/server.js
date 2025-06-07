// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const db = require("./db");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// CORS: allow both http://localhost:5500 and http://127.0.0.1:5500
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,      // false for dev over HTTP
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Mount all /api/auth routes
app.use("/api/auth", authRoutes);

// (Optional) Serve frontend files if you ever open via http://localhost:5000
app.use(express.static(path.join(__dirname, "../client")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Test DB connection on startup
db.query("SELECT 1")
  .then(() => console.log("✅ DB connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
