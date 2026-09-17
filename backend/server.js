const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("../VARDAAN"));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("GMAIL CONNECTION FAILED:");
    console.error(error);
  } else {
    console.log("GMAIL CONNECTION SUCCESSFUL!");
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("GMAIL CONNECTION FAILED:");
    console.error(error);
  } else {
    console.log("GMAIL CONNECTION SUCCESSFUL!");
  }
})

// =========================
// TEST
// =========================

app.get("/", (req, res) => {
  res.send("Vardaan backend is running.");
});


// =========================
// EMAIL VERIFICATION STORAGE
// =========================

const verificationCodes = {};


// =========================
// SEND VERIFICATION CODE
// =========================

app.post("/api/send-code", async (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required."
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  verificationCodes[email] = {
    code: code,
    expires: Date.now() + 10 * 60 * 1000
  };

  try {

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: email,

      subject: "Your Vardaan verification code",

      text: `
Your Vardaan verification code is:

${code}

This code will expire in 10 minutes.

If you did not request this code, you can ignore this email.
      `

    });

    console.log("Verification code sent to:", email);

    res.json({
      success: true,
      message: "Verification code sent."
    });

  } catch (error) {

    console.error("Verification email error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send verification code."
    });

  }

});


// =========================
// VERIFY EMAIL
// =========================

app.post("/api/verify-code", (req, res) => {

  const { email, code } = req.body;

  const record = verificationCodes[email];

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "No verification code found."
    });
  }

  if (Date.now() > record.expires) {

    delete verificationCodes[email];

    return res.status(400).json({
      success: false,
      message: "Verification code expired."
    });

  }

  if (record.code !== code) {

    return res.status(400).json({
      success: false,
      message: "Incorrect verification code."
    });

  }

  delete verificationCodes[email];

  res.json({
    success: true,
    message: "Email verified."
  });

});


// =========================
// SEND HELP REQUEST
// =========================

app.post("/api/contact", async (req, res) => {

  const { name, email, message } = req.body;

  if (!name || !email || !message) {

    return res.status(400).json({
      success: false,
      message: "Please fill in all fields."
    });

  }

  try {

    await transporter.sendMail({

      from: process.env.EMAIL_USER,

      to: "alainapauly@gmail.com",

      subject: `Vardaan Help Request from ${name}`,

      text: `
New verified message from the Vardaan website.

Name: ${name}
Email: ${email}

Message:
${message}
      `

    });

    res.json({
      success: true,
      message: "Your verified signal has been sent to Vardaan."
    });

  } catch (error) {

    console.error("Email error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send your signal right now."
    });

  }

});


// =========================
// VARDAAN CHAT
// =========================

app.post("/api/chat", async (req, res) => {

  const { message } = req.body;

  if (!message || !message.trim()) {

    return res.status(400).json({
      success: false,
      message: "Please enter a message."
    });

  }

  const text = message.toLowerCase();

  let reply;

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {

    reply =
      "Hello. I'm Vardaan. I'm listening. Tell me what is happening.";

  } else if (
    text.includes("sad") ||
    text.includes("upset") ||
    text.includes("cry")
  ) {

    reply =
      "You don't have to hide how you feel. Take a breath and tell me what is making today difficult.";

  } else if (
    text.includes("scared") ||
    text.includes("afraid") ||
    text.includes("fear")
  ) {

    reply =
      "Fear can feel overwhelming. Take one slow breath and tell me what is frightening you.";

  } else if (
    text.includes("alone") ||
    text.includes("lonely")
  ) {

    reply =
      "You don't have to carry everything silently. Is there someone you trust that you can talk to?";

  } else if (
    text.includes("help") ||
    text.includes("problem") ||
    text.includes("trouble")
  ) {

    reply =
      "I'm listening. You don't need perfect words. Tell me what is happening, one step at a time.";

  } else if (text.includes("thank")) {

    reply =
      "You're welcome. Keep going. Sometimes speaking about what you're carrying is the first step.";

  } else {

    reply =
      "I'm listening. Tell me a little more about what is happening, and we'll take it one step at a time.";

  }

  res.json({
    success: true,
    reply: reply
  });

});


// =========================
// START SERVER
// =========================

app.listen(PORT, () => {

  console.log(
    `Vardaan backend running at http://localhost:${PORT}`
  );

});