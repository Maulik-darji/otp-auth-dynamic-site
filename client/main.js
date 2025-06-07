// client/main.js

// ← Change this if your backend origin is different
const API_BASE = "http://localhost:5000/api/auth";

const regName       = document.getElementById("reg-name");
const regAge        = document.getElementById("reg-age");
const regEmail      = document.getElementById("reg-email");
const regPassword   = document.getElementById("reg-password");
const btnRegister   = document.getElementById("btn-register");

const loginEmail    = document.getElementById("login-email");
const btnRequestOtp = document.getElementById("btn-request-otp");
const otpForm       = document.getElementById("otp-form");
const otpInput      = document.getElementById("otp-input");

const welcomeSection = document.getElementById("welcome-section");
const welcomeDiv     = document.getElementById("welcome");
const btnLogout      = document.getElementById("btn-logout");

const registerSection = document.getElementById("register-section");
const loginSection    = document.getElementById("login-section");

// Keep track of which email we’re logging in
let currentEmail = "";

// ─── Helper: Show welcome + hide others ─────────────────────────────
function showWelcome(name) {
  registerSection.style.display = "none";
  loginSection.style.display    = "none";
  otpForm.style.display         = "none";
  welcomeSection.style.display  = "block";
  welcomeDiv.textContent        = `Hello ${name}`;
  document.body.style.background = "black";
}

// ─── Check if already logged in (on page load) ──────────────────────
(async () => {
  try {
    const res  = await fetch(`${API_BASE}/me`, {
      credentials: "include",
    });
    const data = await res.json();
    if (data.loggedIn) {
      showWelcome(data.name);
    }
  } catch (err) {
    console.error("Error checking login:", err);
  }
})();

// ─── Registration handler ───────────────────────────────────────────
btnRegister.onclick = async () => {
  const name     = regName.value.trim();
  const age      = Number(regAge.value);
  const email    = regEmail.value.trim();
  const password = regPassword.value.trim();

  if (!name || !age || !email || !password) {
    alert("All fields required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, age, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Registered & logged in as " + data.name);
      showWelcome(data.name);
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (err) {
    alert("Server error during registration");
    console.error(err);
  }
};

// ─── Request OTP handler ────────────────────────────────────────────
btnRequestOtp.onclick = async () => {
  const email = loginEmail.value.trim();
  if (!email) {
    alert("Enter your email");
    return;
  }
  currentEmail = email;

  try {
    const res = await fetch(`${API_BASE}/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("OTP sent to your email");
      // Show OTP input form
      otpForm.style.display    = "block";
      btnRequestOtp.style.display = "none";
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Server error sending OTP");
    console.error(err);
  }
};

// ─── Verify OTP handler ─────────────────────────────────────────────
otpForm.onsubmit = async (e) => {
  e.preventDefault();
  const otp = otpInput.value.trim();
  if (!otp) {
    alert("Enter OTP");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login-with-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: currentEmail, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Logged in as " + data.name);
      showWelcome(data.name);
    } else {
      alert(data.message || "OTP invalid/expired");
    }
  } catch (err) {
    alert("Server error verifying OTP");
    console.error(err);
  }
};

// ─── Logout handler ─────────────────────────────────────────────────
btnLogout.onclick = async () => {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    alert("Logged out");
    window.location.reload();
  } catch (err) {
    console.error("Logout error:", err);
  }
};
