import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import cookieSession from "cookie-session";
import userRouter from "./routes/user.routes";
import chatRouter from './routes/chat.routes';
import chatSocket from './sockets/chat.socket';
import dotenv from "dotenv";
dotenv.config();

// Create server
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:4321",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

if (!process.env.COOKIE_PRIMARY_KEY || !process.env.COOKIE_SECONDARY_KEY) {
  throw new Error("Missing cookie keys!");
}

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.COOKIE_PRIMARY_KEY!, process.env.COOKIE_SECONDARY_KEY!],
    maxAge: 3 * 60 * 1000,
    sameSite: "lax",
  })
);

app.use(express.json());

// Routes
app.use("/users", userRouter);
app.use('/chat', chatRouter);

// Create HTTP server and attach SocketIO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4321",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB and start server
const MONGO_URI = process.env.DATABASE_URL!;
mongoose
  .connect(MONGO_URI, { dbName: "chatting_app" })
  .then(() => {
    console.log("Connected to MongoDB database");

    // Start Socket.IO
    chatSocket(io);

    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
