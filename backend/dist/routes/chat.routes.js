"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = __importDefault(require("../controllers/chat.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const chatRouter = express_1.default.Router();
// get contact list
chatRouter.get('/', auth_middleware_1.checkLogin, chat_controller_1.default.getUserChatRooms);
// create new chat group
chatRouter.post('/', auth_middleware_1.checkLogin, chat_controller_1.default.createChatRoom);
// get all message in a room
chatRouter.get('/messages/:roomId', auth_middleware_1.checkLogin, chat_controller_1.default.getMessagesByRoom);
exports.default = chatRouter;
