import mongoose, { Schema } from 'mongoose';

const RoomSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  name: { type: String },
  latestMessage: { type: String },
  messageCount: { type: Number, default: 0 },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, { timestamps: true });

RoomSchema.index({ users: 1 }, { unique: false });

export const Room = mongoose.model("Room", RoomSchema);
