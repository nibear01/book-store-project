// Reset an admin's password directly in the database (for when the admin is locked out).
// Usage (from the backend folder):  node scripts/reset-admin-password.js admin@example.com
// The new password is asked for interactively (hidden), so it never lands in shell history.
// Uses MONGO_URI from backend/.env (or the environment).
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import readline from "readline";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user-model.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

// One reader for every question (a reader per question can swallow input meant for the next)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: !!process.stdin.isTTY });
let muted = false;
const writeOutput = rl._writeToOutput.bind(rl);
rl._writeToOutput = (s) => {
  if (!muted) writeOutput(s); // hide typed characters while a password is entered
};
// Queue typed (or piped) lines and hand one to each question in order
const lines = [];
const waiters = [];
let inputClosed = false;
rl.on("line", (line) => (waiters.length ? waiters.shift()(line) : lines.push(line)));
rl.on("close", () => {
  inputClosed = true;
  while (waiters.length) waiters.shift()("");
});
const ask = (question, { hidden = false } = {}) =>
  new Promise((resolve) => {
    process.stdout.write(question);
    muted = hidden;
    const done = (answer) => {
      if (muted && process.stdin.isTTY) process.stdout.write("\n");
      muted = false;
      resolve(answer);
    };
    if (lines.length) done(lines.shift());
    else if (inputClosed) done("");
    else waiters.push(done);
  });

const fail = async (msg) => {
  console.error(msg);
  rl.close();
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
};

const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/reset-admin-password.js <admin email>");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set (backend/.env).");
  process.exit(1);
}

// Show which cluster we're about to touch, without the credentials
const target = process.env.MONGO_URI.replace(/\/\/[^@]*@/, "//***@").split("?")[0];
console.log(`Database: ${target}`);

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

const user = await User.findOne({ email }).select("name email roles status");
if (!user) await fail(`No user with email ${email}.`);
const roles = Array.isArray(user.roles) ? user.roles : [];
console.log(`Found: ${user.name} <${user.email}>  roles: ${roles.join(", ") || "-"}  status: ${user.status}`);
if (!roles.includes("admin")) await fail("That account is not an admin. Nothing changed.");

const pw1 = await ask("New password (min 8 characters): ", { hidden: true });
if (pw1.length < 8) await fail("Password must be at least 8 characters. Nothing changed.");
const pw2 = await ask("Repeat new password: ", { hidden: true });
if (pw1 !== pw2) await fail("Passwords don't match. Nothing changed.");

const confirm = await ask(`Set this as the new password for ${user.email}? (yes/no): `);
if (confirm.trim().toLowerCase() !== "yes") await fail("Cancelled. Nothing changed.");

const result = await User.updateOne(
  { _id: user._id },
  {
    $set: {
      password: await bcrypt.hash(pw1, 10),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  }
);
console.log(result.modifiedCount === 1 ? "Password updated. You can log in now." : "No change was written.");
if (user.status !== "active") {
  console.log(`Note: this account's status is "${user.status}", so login will still be refused until it is active.`);
}
rl.close();
await mongoose.disconnect();
