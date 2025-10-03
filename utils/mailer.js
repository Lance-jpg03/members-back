// src/utils/mailer.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection at startup
transporter.verify((error, success) => {
  if (error) {
    console.error(" Gmail transporter verification failed:", error);
  } else {
    console.log(" Gmail transporter ready to send emails");
  }
});

/**
 * Send ticket notification to assignee
 */
async function sendTicketNotification({ ticketId, name, email, department, urgency, description, assignee }) {
  if (!assignee) throw new Error("Assignee email is missing");

  const mailOptions = {
    from: `"Ticketing System" <${process.env.EMAIL_USER}>`,
    to: assignee,
    subject: `🎫 New Ticket Assigned [${urgency}]`,
    text: `
Hello,

A new ticket has been assigned to you:
Ticket #${ticketId} has been assigned to you:

- Requester: ${name} (${email})
- Department: ${department}
- Urgency: ${urgency}

Description:
${description}

Please check the ticketing system to proceed.

Thank you,
Ticketing System
    `,
    html: `
      <p>Hello,</p>
      <p>A new ticket has been assigned to you:</p>
      <ul>
        <li><b>Requester:</b> ${name} (${email})</li>
        <li><b>Department:</b> ${department}</li>
        <li><b>Urgency:</b> ${urgency}</li>
      </ul>
      <p><b>Description:</b><br>${description}</p>
      <p>Please check the ticketing system to proceed.</p>
      <p>Thank you,<br>Ticketing System</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(" Gmail sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("Gmail sending error:", err.response || err);
    throw err;
  }
}

/**
 * Send confirmation email to requester
 */
async function sendRequesterConfirmation({ ticketId, name, email, department, urgency, description, assignee }) {
  if (!email) throw new Error("Requester email is missing");

  const mailOptions = {
    from: `"Ticketing System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Ticket Submitted Successfully [#${ticketId}]`,
    text: `
Hello ${name},

Your ticket has been submitted successfully.

- Ticket ID: ${ticketId}
- Department: ${department}
- Urgency: ${urgency}
- Assigned To: ${assignee}

Description:
${description}

We will keep you updated on the status of your request.

Thank you,
Ticketing System
    `,
    html: `
      <p>Hello <b>${name}</b>,</p>
      <p>Your ticket has been submitted successfully.</p>
      <ul>
        <li><b>Ticket ID:</b> ${ticketId}</li>
        <li><b>Department:</b> ${department}</li>
        <li><b>Urgency:</b> ${urgency}</li>
        <li><b>Assigned To:</b> ${assignee}</li>
      </ul>
      <p><b>Description:</b><br>${description}</p>
      <p>We will keep you updated on the status of your request.</p>
      <p>Thank you,<br>Ticketing System</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(" Gmail confirmation sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("Gmail confirmation error:", err.response || err);
    throw err;
  }
}

module.exports = { sendTicketNotification, sendRequesterConfirmation };


