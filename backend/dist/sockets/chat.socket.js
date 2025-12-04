"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chat_model_1 = require("../models/chat.model");
const setupChatSocket = (io) => {
    io.on('connection', (socket) => {
        // On connect
        console.log(`User connected: ${socket.id}`);
        const joinedRooms = new Set();
        // Join
        socket.on('joinRoom', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { roomId } = data;
                if (!roomId || !mongoose_1.default.Types.ObjectId.isValid(roomId)) {
                    console.error('Invalid roomId:', roomId);
                    return;
                }
                if (!joinedRooms.has(roomId)) {
                    socket.join(roomId);
                    joinedRooms.add(roomId);
                    const previousMessages = yield chat_model_1.Chat.find({ roomId: new mongoose_1.default.Types.ObjectId(roomId) })
                        .sort({ createdAt: 1 })
                        .lean();
                    socket.emit('previousMessages', { roomId, messages: previousMessages });
                }
            }
            catch (err) {
                console.error('joinRoom error:', err);
            }
        }));
        // Leave
        socket.on('leaveRoom', (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { roomId } = data;
                if (roomId && joinedRooms.has(roomId)) {
                    socket.leave(roomId);
                    joinedRooms.delete(roomId);
                    socket.emit('clearMessages', { roomId });
                }
            }
            catch (err) {
                console.error('leaveRoom error:', err);
            }
        }));
        // Postmessage
        socket.on('sendMessage', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { roomId, username, message } = data;
            try {
                // Save message in MongoDB
                const chat = new chat_model_1.Chat({ roomId, username, message });
                yield chat.save();
                io.to(roomId).emit('newMessage', chat);
            }
            catch (err) {
                console.error('Error saving chat:', err);
            }
        }));
        // Disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
            joinedRooms.clear();
        });
    });
};
exports.default = setupChatSocket;
