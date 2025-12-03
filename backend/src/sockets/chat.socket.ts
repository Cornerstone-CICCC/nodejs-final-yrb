import { Server, Socket } from 'socket.io'
import mongoose from 'mongoose'
import { Chat } from '../models/chat.model'

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
            .sort({ createdAt: 1 })
            .lean();
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
      const { roomId, username, message } = data
      try{
        // Save message in MongoDB
        const chat = new Chat({ roomId, username, message })
        await chat.save()

        io.to(roomId).emit('newMessage', chat)
      } catch(err){
        console.error('Error saving chat:', err)
      }
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
      joinedRooms.clear()
    })
  })
}

export default setupChatSocket
