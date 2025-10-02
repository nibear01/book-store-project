import dotenv from "dotenv";
dotenv.config();
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
import seedDefaultCategories from "./seed/seed-categories.js";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
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

const startServer = async () => {
  await connectDb();
  if (process.env.SEED_CATEGORIES === "true") {
    try {
      const result = await seedDefaultCategories();
      console.log(`Category seed: ${result.message}`);
    } catch (e) {
      console.warn("Category seeding failed:", e.message);
    }
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
