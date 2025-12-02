import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env file
dotenv.config();

// Get port and DB URI from environment variables
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DATABASE_URI || "";

if (!DB_URI) {
  console.error("DATABASE_URI is not set.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ MongoDB connection successful!");
    // Simple message for server test
    console.log(`Server is ready on port ${PORT}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
