import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import connectDb from "./config/db.js";
import userRoutes from "./routes/user-routes.js";
import bookRoutes from "./routes/book-routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

const startServer = async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
