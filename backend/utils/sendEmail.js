// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendEmail = async (toEmail, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.sendMail({
      from: `"OTP System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
    });

    console.log(`✅ OTP sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err);
  }
};

module.exports = sendEmail;
