"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const login_model_1 = require("../models/login.model");
// 회원가입
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, nickname, password } = req.body;
    try {
        const existingUser = yield login_model_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const user = new login_model_1.User({ email, nickname, password });
        yield user.save();
        // 세션에 로그인 상태 저장
        req.session.userId = user._id.toString();
        res
            .status(201)
            .json({ user: { email: user.email, nickname: user.nickname } });
    }
    catch (err) {
        console.error("Error in register:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
});
// 로그인
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield login_model_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        req.session.userId = user._id.toString();
        res
            .status(200)
            .json({ user: { email: user.email, nickname: user.nickname } });
    }
    catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
});
// 로그아웃
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error in logout:", err);
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.status(200).json({ message: "Logged out successfully" });
    });
};
exports.default = { register, login, logout };
