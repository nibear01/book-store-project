
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled",
    });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // ✅ fixes self-signed certificate issue
      },
    });

    // Verify connection
    await transporter.verify();
 

    // Define mail content
    const mailOptions = {
      from: `${email}`,
      to: process.env.SMTP_USER,
      subject: subject || "New Contact Message",
      html: `
        <h2>📩 New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.log(error)
    
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
      
    });
  }
});

export default router;
