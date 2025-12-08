"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const chat_socket_1 = __importDefault(require("./sockets/chat.socket"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create server
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: "http://localhost:4321",
    methods: ["GET", "POST"],
    credentials: true,
}));
if (!process.env.COOKIE_PRIMARY_KEY || !process.env.COOKIE_SECONDARY_KEY) {
    throw new Error("Missing cookie keys!");
}
app.use((0, cookie_session_1.default)({
    name: "session",
    keys: [process.env.COOKIE_PRIMARY_KEY, process.env.COOKIE_SECONDARY_KEY],
    maxAge: 25 * 60 * 1000,
    sameSite: "lax",
    secure: false,
}));
app.use(express_1.default.json());
// Routes
app.use("/users", user_routes_1.default);
app.use("/chat", chat_routes_1.default);
// Create HTTP server and attach SocketIO
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:4321",
        methods: ["GET", "POST"],
    },
});
// Connect to MongoDB and start server
const MONGO_URI = process.env.DATABASE_URL;
mongoose_1.default
    .connect(MONGO_URI, { dbName: "chatting_app" })
    .then(() => {
    console.log("Connected to MongoDB database");
    // Start Socket.IO
    (0, chat_socket_1.default)(io);
    // Start the server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});
