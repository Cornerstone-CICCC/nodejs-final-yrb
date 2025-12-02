"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load .env file
dotenv_1.default.config();
// Get port and DB URI from environment variables
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DATABASE_URI || "";
if (!DB_URI) {
    console.error("DATABASE_URI is not set.");
    process.exit(1);
}
// Connect to MongoDB
mongoose_1.default
    .connect(DB_URI)
    .then(() => {
    console.log("✅ MongoDB connection successful!");
    // Simple message for server test
    console.log(`Server is ready on port ${PORT}`);
})
    .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
});
