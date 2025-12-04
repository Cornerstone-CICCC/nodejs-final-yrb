import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  users: [{ type: String, required: true }],
  name: { type: String },
  latestMessage: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, { timestamps: true });

RoomSchema.index({ users: 1 }, { unique: false });

export const Room = mongoose.model("Room", RoomSchema);
