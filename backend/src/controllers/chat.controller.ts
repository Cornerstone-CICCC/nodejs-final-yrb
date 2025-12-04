import { Request, Response } from 'express'
import { Room } from '../models/room.model'
import { Chat } from '../models/chat.model'
import { User } from '../models/user.model'

// const DUMMY_USER_ID = 'dummyUserId';

// Get chatrooms for a user (Contact List)
const getUserChatRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId
    // const userId = DUMMY_USER_ID
    if(!userId) return res.status(401).json({ error: "User not authenticated."})
    
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
    if(!req.session || !req.session.userId){
      return res.status(401).json({ error: "User not authenticated" })
    }
    const userA = req.session.userId
    // const userA = DUMMY_USER_ID
    
    const { usernameB } = req.body
    if (!usernameB) return res.status(400).json({ error: 'Recipient username required' });

    // check if userB exists
    const userB = await User.findOne({ username: usernameB })
    if(!userB) return res.status(400).json({ error: "User does not exist" })


    let room = await Room.findOne({ users: { $all: [userA, userB._id] } });
    if (!room) {
      room = new Room({ users: [userA, userB._id] });
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
