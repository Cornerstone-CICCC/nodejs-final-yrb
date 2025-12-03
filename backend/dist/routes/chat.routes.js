"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
// import authMiddleware from '../middleware/auth.middleware'
const chatRouter = express_1.default.Router();
// chatRouter.use(authMiddleware);
// get contact list
chatRouter.get('/', chat_controller_1.default.getUserChatRooms);
// create new chat group
chatRouter.post('/', chat_controller_1.default.createChatRoom);
// get all message in a room
chatRouter.get('/:roomId/messages', chat_controller_1.default.getMessagesByRoom);
exports.default = chatRouter;
