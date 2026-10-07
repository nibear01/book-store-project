import dotenv from "dotenv";
// Load backend/.env no matter which folder the server is started from
dotenv.config({ path: fileURLToPath(new URL(".env", import.meta.url)) });
import cors from "cors";
import express from "express";
import connectDb from "./config/db.js";
import userRoutes from "./routes/user-routes.js";
import bookRoutes from "./routes/book-routes.js";
import cartRoutes from "./routes/cart-routes.js";
import orderRoutes from "./routes/order-routes.js";
import wishlistRoutes from "./routes/wishlist-routes.js";
import categoryRoutes from "./routes/category-routes.js";
import reviewRoutes from "./routes/review-routes.js";
import otpRoutes from "./routes/otp-routes.js";
import authorRequestRoutes from "./routes/author-request-routes.js";
import bookRequestRoutes from "./routes/book-request-routes.js";
import subscriberRoutes from "./routes/subscriber-routes.js";
import settingRoutes from "./routes/setting-routes.js";
import seedDefaultCategories from "./seed/seed-categories.js";
import contactRoutes from "./routes/contact-routes.js";

import path from "path";
import { fileURLToPath } from "url";
import authorRoutes from "./routes/author-routes.js";
import publisherRoutes from "./routes/publisher-routes.js";
import affiliateRoutes from "./routes/affiliate-routes.js";
import affiliateAdminRoutes from "./routes/affiliate-admin-routes.js";
import rateLimit from "express-rate-limit";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; 

// CORS configuration for production
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Behind Render's proxy: use X-Forwarded-For so rate limits are per client, not per proxy
app.set("trust proxy", 1);

app.use(express.json());
app.use(cors(corsOptions));

// Strip MongoDB operator keys ($ne, $gt, ...) from request bodies so user input
// can never become a query operator (e.g. { token: { $ne: null } })
const stripMongoOperators = (value) => {
  if (Array.isArray(value)) return value.map(stripMongoOperators);
  if (value && typeof value === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith("$")) continue;
      clean[k] = stripMongoOperators(v);
    }
    return clean;
  }
  return value;
};
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") req.body = stripMongoOperators(req.body);
  next();
});

// Rate limiting for auth/OTP endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users/forgot-password", authLimiter);
app.use("/api/otp", authLimiter);
app.use("/api/affiliates/login", authLimiter);
app.use("/api/affiliates/register", authLimiter);

// Public forms that send email or create records: throttle per client
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/author-requests/otp", publicFormLimiter);
app.use("/api/author-requests/submit", publicFormLimiter);
app.use("/api/book-requests/submit", publicFormLimiter);
app.use("/api/contact", publicFormLimiter);
// Only the public subscribe endpoint (POST /api/subscribers), not the admin routes under it
app.use("/api/subscribers", (req, res, next) =>
  req.method === "POST" && req.path === "/" ? publicFormLimiter(req, res, next) : next()
);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/author-requests", authorRequestRoutes);
app.use("/api/book-requests", bookRequestRoutes);
app.use("/api/authors", authorRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/publishers", publisherRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/affiliates", affiliateRoutes);
app.use("/api/admin/affiliates", affiliateAdminRoutes);

// Health check
app.get("/", (req, res) => {
  return res.send("Server is running...");
});

// 404 handler for unmatched routes
app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Route not found" });
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const startServer = async () => {
  // Tokens can't be signed or verified safely without a secret
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Refusing to start.");
    process.exit(1);
  }
  await connectDb();
  if (process.env.SEED_CATEGORIES === "true") {
    try {
      const result = await seedDefaultCategories();
      console.log(`Category seed: ${result.message}`);
    } catch (e) {
      console.warn("Category seeding failed:", e.message);
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
