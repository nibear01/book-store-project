import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool: reuse connections instead of creating new ones
      maxPoolSize: 10,
      // Close sockets after 45s of inactivity (helps on Render free tier)
      socketTimeoutMS: 45000,
      // Time out initial connection after 10s
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDb;  