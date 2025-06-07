const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

// Generate a 6-digit OTP as string
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, age, email, password } = req.body;
    if (!name || !age || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if email already exists
    const check = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (name, age, email, password) VALUES ($1, $2, $3, $4)",
      [name, age, email, hashed]
    );

    req.session.user = { email, name };
    return res.json({ success: true, name });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── REQUEST OTP ─────────────────────────────────────────────────────────────
router.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.query(
      "UPDATE users SET otp = $1, otp_expire = $2 WHERE email = $3",
      [otp, expireTime, email]
    );

    await sendEmail(email, otp);
    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Request OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── LOGIN WITH OTP ──────────────────────────────────────────────────────────
router.post("/login-with-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expire > NOW()",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    const user = result.rows[0];
    req.session.user = { email: user.email, name: user.name };
    return res.json({ success: true, name: user.name });
  } catch (err) {
    console.error("Login-with-OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ─── LOGOUT ─────────────────────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
});

// ─── GET CURRENT USER ────────────────────────────────────────────────────────
router.get("/me", (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, name: req.session.user.name });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;
