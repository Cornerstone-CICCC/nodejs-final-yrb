import { Request, Response } from 'express'
import { Room } from '../models/room.model'
import { Chat } from '../models/chat.model'
import { User } from '../models/user.model'
import mongoose from 'mongoose'

// const DUMMY_USER_ID = 'dummyUserId';

// Get chatrooms for a user (Contact List)
const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId
    // const userId = DUMMY_USER_ID
    if(!userId) return res.status(401).json({ error: "User not authenticated."})

    const mongoUserId = new mongoose.Types.ObjectId(userId)
    let rooms = await Room.find({ users: mongoUserId })
    .populate('users', 'username avatar')
    .sort({ updatedAt: -1 })
    .lean();

    // latestMessage y contador
    for (let room of rooms) {
      const latestChat = await Chat.findOne({ roomId: room._id }).sort({ createdAt: -1 }).lean();
      room.latestMessage = latestChat ? latestChat.message : '';
      (room as any).unreadCount = room.messageCount || 0;
    }

    // search
    const keyword = req.query.q as string | undefined;
    if (keyword) {
      rooms = rooms.filter(
        (room) =>
          (room.name && room.name.toLowerCase().includes(keyword.toLowerCase())) ||
          (room.latestMessage && room.latestMessage.toLowerCase().includes(keyword.toLowerCase()))
      );
    }

    res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get chat rooms' });
  }
};


// Create a new chatroom (or return existing one)
const createChatRoom = async (req: Request, res: Response) => {
  try {
    if(!req.session || !req.session.userId){
      return res.status(401).json({ error: "User not authenticated" })
    }
    const userA = req.session.userId
    // const userA = DUMMY_USER_ID
    
    const { userB } = req.body
    if (!userB) return res.status(400).json({ error: 'Recipient username required' });

    // check if userB exists
    const userBObj = await User.findOne({ username: userB })
    if(!userBObj) return res.status(400).json({ error: "User does not exist" })


    let room = await Room.findOne({
      users: { $all: [new mongoose.Types.ObjectId(userA), userBObj._id] } });
    if (!room) {
      room = new Room({
        users: [
          new mongoose.Types.ObjectId(userA),
          userBObj._id
        ]
      });
      await room.save();
    }

    const populatedRoom = await Room.findById(room._id)
    .populate('users', 'username')
    .lean()
    .exec()
    if(!populatedRoom){
      return res.status(500).json({ error: "Failed to create chat room"})
    }

    const userAId = req.session.userId
    const otherUsernames = populatedRoom.users
    .filter((u: any) => u._id.toString() !== userAId)
    .map((u: any) => u.username)
    .join(" & ")

    res.status(200).json({
      ...populatedRoom,
      otherUsernames
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
};


// Get messages for a specific room
const getMessagesByRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId
    if(!userId) return res.status(401).json({ error: "Login required" })

    const { roomId } = req.params

    // check if user is a member of room
    const room = await Room.findById(roomId)
    if(!room) return res.status(404).json({ message: "Room not found"})
    if(!room.users.map(id => id.toString()).includes(userId)){
      return res.status(403).json({ error: "You are not a member of this room" })
    }

    const messages = await Chat.find({ roomId }).sort({ createdAt: 1 })
    
    // Resetear contador cuando se abre la sala
    await Room.updateOne({ _id: roomId }, { $set: { messageCount: 0 } });
    
    res.status(200).json(messages)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' })
  }
}

export default {
  getUserChatRooms,
  createChatRoom,
  getMessagesByRoom,
}
