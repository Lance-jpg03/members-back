const express = require("express");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    return res.json({
      success: true,
      message: `Welcome, ${email}`,
      email,
    });
  } catch (err) {
    console.error("Google login error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid Google login" });
  }
});

module.exports = router;
