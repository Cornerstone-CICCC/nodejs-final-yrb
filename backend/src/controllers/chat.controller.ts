import { Request, Response } from 'express'
import { Room } from '../models/room.model'
import { Chat } from '../models/chat.model'

const DUMMY_USER_ID = 'dummyUserId';

// Get chatrooms for a user (Contact List)
const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    // const userId = req.user.id as string  // set authMiddleware
    const userId = DUMMY_USER_ID
    const keyword = req.query.q as string | undefined;

    let rooms = await Room.find({ users: userId }).sort({ updatedAt: -1 }).lean();

    // latestMessage
    for (let room of rooms) {
      const latestChat = await Chat.findOne({ roomId: room._id }).sort({ createdAt: -1 }).lean();
      room.latestMessage = latestChat ? latestChat.message : '';
    }

    // search
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
    // const userA = req.user.id
    const userA = DUMMY_USER_ID
    const { userB } = req.body

    if (!userB) return res.status(400).json({ error: 'Recipient userId required' });

    let room = await Room.findOne({ users: { $all: [userA, userB] } });

    if (!room) {
      room = new Room({ users: [userA, userB] });
      await room.save();
    }

    res.status(200).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
};


// Get messages for a specific room
const getMessagesByRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params

    const messages = await Chat.find({ roomId }).sort({ createdAt: 1 })

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
