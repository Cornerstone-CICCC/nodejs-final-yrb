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
Object.defineProperty(exports, "__esModule", { value: true });
const room_model_1 = require("../models/room.model");
const chat_model_1 = require("../models/chat.model");
const user_model_1 = require("../models/user.model");
// const DUMMY_USER_ID = 'dummyUserId';
// Get chatrooms for a user (Contact List)
const getUserChatRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.session.userId;
        // const userId = DUMMY_USER_ID
        if (!userId)
            return res.status(401).json({ error: "User not authenticated." });
        const keyword = req.query.q;
        let rooms = yield room_model_1.Room.find({ users: userId }).sort({ updatedAt: -1 }).lean();
        // latestMessage
        for (let room of rooms) {
            const latestChat = yield chat_model_1.Chat.findOne({ roomId: room._id }).sort({ createdAt: -1 }).lean();
            room.latestMessage = latestChat ? latestChat.message : '';
        }
        // search
        if (keyword) {
            rooms = rooms.filter((room) => (room.name && room.name.toLowerCase().includes(keyword.toLowerCase())) ||
                (room.latestMessage && room.latestMessage.toLowerCase().includes(keyword.toLowerCase())));
        }
        res.status(200).json(rooms);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get chat rooms' });
    }
});
// Create a new chatroom (or return existing one)
const createChatRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        const userA = req.session.userId;
        // const userA = DUMMY_USER_ID
        const { usernameB } = req.body;
        if (!usernameB)
            return res.status(400).json({ error: 'Recipient username required' });
        // check if userB exists
        const userB = yield user_model_1.User.findOne({ username: usernameB });
        if (!userB)
            return res.status(400).json({ error: "User does not exist" });
        let room = yield room_model_1.Room.findOne({ users: { $all: [userA, userB._id] } });
        if (!room) {
            room = new room_model_1.Room({ users: [userA, userB._id] });
            yield room.save();
        }
        res.status(200).json(room);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create chat room' });
    }
});
// Get messages for a specific room
const getMessagesByRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.session.userId;
        if (!userId)
            return res.status(401).json({ error: "Login required" });
        const { roomId } = req.params;
        // check if user is a member of room
        const room = yield room_model_1.Room.findById(roomId);
        if (!room)
            return res.status(404).json({ message: "Room not found" });
        if (!room.users.map(id => id.toString()).includes(userId)) {
            return res.status(403).json({ error: "You are not a member of this room" });
        }
        const messages = yield chat_model_1.Chat.find({ roomId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});
exports.default = {
    getUserChatRooms,
    createChatRoom,
    getMessagesByRoom,
};
