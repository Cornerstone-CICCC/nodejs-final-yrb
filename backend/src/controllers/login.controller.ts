import { Request, Response } from "express";
import { User } from "../models/login.model";

// 회원가입
const register = async (req: Request, res: Response) => {
  const { email, nickname, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({ email, nickname, password });
    await user.save();

    // 세션에 로그인 상태 저장
    req.session!.userId = user._id.toString();

    res
      .status(201)
      .json({ user: { email: user.email, nickname: user.nickname } });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 로그인
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    req.session!.userId = user._id.toString();

    res
      .status(200)
      .json({ user: { email: user.email, nickname: user.nickname } });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// 로그아웃
const logout = (req: Request, res: Response) => {
  req.session!.destroy((err) => {
    if (err) {
      console.error("Error in logout:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully" });
  });
};

export default { register, login, logout };
