import express from 'express'
import chatController from '../controllers/chat.controller'
// import authMiddleware from '../middleware/auth.middleware'

const chatRouter = express.Router()

// chatRouter.use(authMiddleware);

// get contact list
chatRouter.get('/', chatController.getUserChatRooms);

// create new chat group
chatRouter.post('/', chatController.createChatRoom);

// get all message in a room
chatRouter.get('/messages/:roomId', chatController.getMessagesByRoom);

export default chatRouter;