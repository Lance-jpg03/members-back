// // utils/mailer.js

const express = require("express");
const router = express.Router();
const { getUserPool } = require("../dbUserPool");
const { sendTicketNotification, sendRequesterConfirmation } = require("../utils/mailer");

// Middleware for Basic Auth
function getCredentialsFromBasicAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Basic ")) {
    return res.status(401).json({ error: "Missing Basic Auth header" });
  }
  const base64Credentials = auth.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString("ascii");
  const [username, password] = credentials.split(":");
  if (!username || !password) {
    return res.status(401).json({ error: "Invalid Basic Auth credentials" });
  }
  req.dbUser = username.trim();
  req.dbPass = password.trim();
  next();
}

// Create ticket with assignee
router.post("/", getCredentialsFromBasicAuth, async (req, res) => {
  console.log(" Incoming request body:", req.body);

  const { name, email, department, urgency, description, assignee } = req.body;

  // Validate input
  if (!name || !email || !department || !urgency || !description || !assignee) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let pool;
  try {
    pool = await getUserPool(req.dbUser, req.dbPass);

    // Insert ticket and return TicketID
    const result = await pool
      .request()
      .input("Name", name)
      .input("Email", email)
      .input("Department", department)
      .input("Urgency", urgency)
      .input("Description", description)
      .input("Assignee", assignee)
      .query(`
        INSERT INTO coul_tickets (Name, Email, Department, Urgency, Description, Assignee)
        OUTPUT INSERTED.TicketID
        VALUES (@Name, @Email, @Department, @Urgency, @Description, @Assignee)
      `);

    const ticketId = result.recordset[0].TicketID;
    console.log(" Ticket inserted successfully, ID:", ticketId);

    // Send notification emails
    await sendTicketNotification({
      ticketId,
      name,
      email,
      department,
      urgency,
      description,
      assignee,
    });

    await sendRequesterConfirmation({
      ticketId,
      name,
      email,
      department,
      urgency,
      description,
      assignee,
    });

    console.log(" Email notification sent to assignee and requester");
    res.status(201).json({ message: "Ticket submitted and assigned successfully" });

  } catch (err) {
    console.error(" Error processing ticket:", err);
    return res.status(500).json({ error: "Failed to process ticket" });
  } finally {
    if (pool) await pool.close();
  }
});

// 📄 Get all tickets
router.get("/", getCredentialsFromBasicAuth, async (req, res) => {
  let pool;
  try {
    pool = await getUserPool(req.dbUser, req.dbPass);
    const result = await pool
      .request()
      .query("SELECT * FROM coul_tickets ORDER BY Created_At DESC");
    await pool.close();
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("GET /api/tickets Error:", err);
    res.status(500).json({ error: "Server error while fetching tickets" });
  }
});

module.exports = router;
