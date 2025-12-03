import mongoose from 'mongoose'

const ChatSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
)

export const Chat = mongoose.model('Chat', ChatSchema)