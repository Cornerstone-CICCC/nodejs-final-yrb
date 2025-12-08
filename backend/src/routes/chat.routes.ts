import express from 'express'
import chatController from '../controllers/chat.controller'
import { checkLogin } from '../middleware/auth.middleware'

const chatRouter = express.Router()


// get contact list
chatRouter.get('/', checkLogin, chatController.getUserChatRooms);

// create new chat group
chatRouter.post('/', checkLogin, chatController.createChatRoom);

// get all message in a room
chatRouter.get('/messages/:roomId', checkLogin, chatController.getMessagesByRoom);

export default chatRouter;