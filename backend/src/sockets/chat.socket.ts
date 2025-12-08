import { Server, Socket } from 'socket.io'
import mongoose from 'mongoose'
import { Chat } from '../models/chat.model'
import { User } from '../models/user.model'
import { Room } from '../models/room.model'

const setupChatSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // On connect
    console.log(`User connected: ${socket.id}`)

    const joinedRooms = new Set<string>()

    // Join
    socket.on('joinRoom', async (data) => {
      try{
        const { roomId } = data

        if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
          console.error('Invalid roomId:', roomId);
          return
        }

        if(!joinedRooms.has(roomId)) {
          socket.join(roomId);
          joinedRooms.add(roomId);

          const previousMessages = await Chat.find({ roomId: new mongoose.Types.ObjectId(roomId) })
            .populate('userId', 'username avatar')
            .sort({ createdAt: 1 })
            .lean()
          socket.emit('previousMessages', { roomId, messages: previousMessages });
        }
      } catch(err){
        console.error('joinRoom error:', err)
      }
    })

    // Leave
    socket.on('leaveRoom', async (data) => {
      try{
        const { roomId } = data
        if(roomId && joinedRooms.has(roomId)) {
          socket.leave(roomId);
          joinedRooms.delete(roomId);
          socket.emit('clearMessages', { roomId });
        }
      } catch(err){
        console.error('leaveRoom error:', err)
      }
    });

    // Postmessage
    socket.on('sendMessage', async (data) => {
      const { roomId, message, userId } = data

      if(!userId){
        console.error("userId is missing")
        return
      }

      if (!roomId || !mongoose.Types.ObjectId.isValid(roomId)) {
        console.error("Invalid roomId:", roomId)
        return
      }

      // Save message in MongoDB
      const chat = await Chat.create({ roomId, message, userId })
      const populatedChat = await chat.populate('userId', 'username avatar');
      
      // Increment message count in Room
      await Room.updateOne({ _id: roomId }, { $inc: { messageCount: 1 } });
      
      io.to(roomId).emit("newMessage", populatedChat);
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
      joinedRooms.clear()
    })
  })
}

export default setupChatSocket
