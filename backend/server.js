const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const db = require("./db"); // Make sure this is correctly set up to connect to your DB
const authRoutes = require("./routes/auth"); // Assuming auth routes are separate

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5500",    // Local dev frontend
  "http://127.0.0.1:5500",   // Local dev frontend
  "https://dynami-otp-login.netlify.app",  // Netlify frontend URL
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,  // Allows cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE"],  // Allow specific methods
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only true in production (HTTPS)
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Mount all /api/auth routes
app.use("/api/auth", authRoutes);

// Serve frontend files in production (if needed)
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
