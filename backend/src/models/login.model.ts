// src/models/user.model.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

// User 인터페이스
export interface IUser extends Document {
  email: string;
  nickname: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User 스키마
const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    nickname: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 비밀번호 해싱 (save 전)
UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 비밀번호 비교 메서드
UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 모델 생성 및 export
export const User = mongoose.model<IUser>("User", UserSchema);
