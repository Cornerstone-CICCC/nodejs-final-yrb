"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RoomSchema = new mongoose_1.default.Schema({
    users: [{ type: String, required: true }],
    name: { type: String },
    latestMessage: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
}, { timestamps: true });
RoomSchema.index({ users: 1 }, { unique: false });
exports.Room = mongoose_1.default.model("Room", RoomSchema);
