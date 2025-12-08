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
exports.changePassword = exports.logout = exports.getAccount = exports.login = exports.setRobohashAvatar = exports.signup = void 0;
const user_model_1 = require("../models/user.model");
/**
 * Sign up (add user)
 */
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }
        const existingEmail = yield user_model_1.User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const avatar = `https://robohash.org/${encodeURIComponent(email)}`;
        const newUser = yield user_model_1.User.create({ username, email, password, avatar });
        if (req.session) {
            req.session.userId = newUser._id.toString();
            req.session.isLoggedIn = true;
        }
        res.status(201).json({
            message: "User created",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
            },
        });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.signup = signup;
const setRobohashAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Login required" });
        const user = yield user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const seed = encodeURIComponent(user.username || user._id.toString());
        const avatarUrl = `https://robohash.org/${seed}`;
        // Save avatar URL in user document
        user.avatar = avatarUrl;
        yield user.save();
        // Fetch the image and return as data URI to avoid CORS/cache issues on the client
        try {
            const fetchRes = yield fetch(avatarUrl);
            if (!fetchRes.ok) {
                // Fallback: return URL only
                return res.status(200).json({ message: "Avatar updated", avatar: avatarUrl });
            }
            const contentType = fetchRes.headers.get("content-type") || "image/png";
            const arrayBuffer = yield fetchRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");
            const dataUri = `data:${contentType};base64,${base64}`;
            return res.status(200).json({ message: "Avatar updated", avatar: avatarUrl, avatarData: dataUri });
        }
        catch (err) {
            console.error("Error fetching robohash image:", err);
            return res.status(200).json({ message: "Avatar updated", avatar: avatarUrl });
        }
    }
    catch (err) {
        console.error("Set Robohash avatar error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.setRobohashAvatar = setRobohashAvatar;
/**
 * Log in (check user)
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username or password missing" });
        }
        const user = yield user_model_1.User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }
        if (req.session) {
            req.session.userId = user._id.toString();
            req.session.isLoggedIn = true;
        }
        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, username: user.username, email: user.email },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.login = login;
/**
 * Get user account
 */
const getAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Login required" });
        const user = yield user_model_1.User.findById(userId).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ user });
    }
    catch (err) {
        console.error("Get account error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getAccount = getAccount;
/**
 * Logout
 */
const logout = (req, res) => {
    if (req.session)
        req.session = null;
    res.status(200).json({ message: "Logout successful!" });
};
exports.logout = logout;
/**
 * Change password
 */
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Login required" });
        const { password, email, avatar } = req.body;
        if (!password && !email && !avatar)
            return res.status(400).json({ message: "Nothing to update" });
        const user = yield user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (email) {
            const emailExists = yield user_model_1.User.findOne({ email });
            if (emailExists && emailExists._id.toString() !== userId) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }
        if (password)
            user.password = password;
        if (avatar)
            user.avatar = avatar;
        yield user.save();
        res.json({
            message: "Account updated",
            user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar },
        });
    }
    catch (err) {
        console.error("Change password/email error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.changePassword = changePassword;
exports.default = {
    setRobohashAvatar: exports.setRobohashAvatar,
    signup: exports.signup,
    login: exports.login,
    getAccount: exports.getAccount,
    logout: exports.logout,
    changePassword: exports.changePassword,
};
