import nodemailer from "nodemailer";
import { getContactFormTemplate } from "../utils/email-templates.js";

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
export const sendContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be filled",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  try {
    // Decide transport based on environment variables
    let transporter;
    const hasSmtpCreds = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

    if (hasSmtpCreds) {
      // Use configured SMTP
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true" || false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      // Fallback to Ethereal in development for easy testing
      const isDev = (process.env.NODE_ENV || "development") === "development";
      if (isDev) {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.warn("SMTP credentials not set. Using Ethereal test account.");
      } else {
        return res.status(500).json({
          success: false,
          message:
            "Email service is not configured. Please set SMTP_USER and SMTP_PASS",
        });
      }
    }

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP connection failed:", verifyError.message);
      return res.status(500).json({
        success: false,
        message: "Email service is currently unavailable. Please try again later.",
      });
    }

    // Generate HTML email using template
    const emailHtml = getContactFormTemplate({
      name,
      email,
      subject: subject || "No Subject",
      message,
    });

    // Define mail options
    const fromAddress = process.env.SMTP_USER || "no-reply@ethereal.email";
    const toAddress = process.env.SMTP_USER || fromAddress;
    const mailOptions = {
      from: `"${name}" <${fromAddress}>`,
      replyTo: email,
      to: toAddress,
      subject: subject || "New Contact Message from BoiBiliash",
      html: emailHtml,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, include preview URL for quick verification
    const previewUrl = nodemailer.getTestMessageUrl(info);

    return res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully! We'll get back to you soon.",
      previewUrl: previewUrl || undefined,
    });
  } catch (error) {
    console.error("Contact form error:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
