import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load .env from backend root even when running this file directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Sanitize env values (strip wrapping quotes and optional spaces)
const sanitize = (v, { removeSpaces } = { removeSpaces: false }) => {
  if (v === undefined || v === null) return "";
  let s = String(v)
    .trim()
    .replace(/^['"]|['"]$/g, "");
  if (removeSpaces) s = s.replace(/\s+/g, "");
  return s;
};

// Gmail-friendly defaults
const smtpHost = sanitize(process.env.SMTP_HOST) || "smtp.gmail.com";
const rawPort = Number(sanitize(process.env.SMTP_PORT)) || 587; // default to 587
const smtpSecure = process.env.SMTP_SECURE
  ? sanitize(process.env.SMTP_SECURE).toLowerCase() === "true"
  : rawPort === 465;
const smtpPort = rawPort;
const smtpUser = sanitize(process.env.SMTP_USER);
const smtpPass = sanitize(process.env.SMTP_PASS, { removeSpaces: true });

if (!smtpUser || !smtpPass) {
  console.error(
    "Email not configured. Set SMTP_USER and SMTP_PASS (Gmail App Password, no spaces) in backend/.env"
  );
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  ...(smtpUser && smtpPass ? { auth: { user: smtpUser, pass: smtpPass } } : {}),
});

export const sendVerificationEmail = async ({
  to,
  code,
  subject = "Your verification code",
}) => {
  if (!to) throw new Error("Missing recipient email");
  if (!code) throw new Error("Missing verification code");
  if (!smtpUser || !smtpPass) {
    throw new Error(
      "Email not configured. Set SMTP_USER and SMTP_PASS in backend/.env"
    );
  }
  const info = await transporter.sendMail({
    from: smtpUser,
    to,
    subject,
    text: `Your verification code is ${code}`,
    html: `<p>Your verification code is <b>${code}</b></p>`,
  });
  return info;
};

// Run only when executed directly: node email-verify.js
if (process.argv[1] && process.argv[1].endsWith("email-verify.js")) {
  sendVerificationEmail({ to, code })
    .then((info) => console.log("Mail sent:", info?.messageId || info))
    .catch((err) => console.error("server error:", err?.message || err));
}

export default transporter;
