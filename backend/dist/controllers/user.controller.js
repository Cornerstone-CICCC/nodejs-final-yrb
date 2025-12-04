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
exports.deleteAccount = exports.changePassword = exports.logout = exports.getAccount = exports.login = exports.signup = void 0;
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
        const newUser = yield user_model_1.User.create({ username, email, password });
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
            },
        });
    }
    catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.signup = signup;
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
    if (req.session) {
        req.session.userId = undefined;
        req.session.isLoggedIn = false;
    }
    res.status(200).json({ message: "Logout successful!" });
};
exports.logout = logout;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Login required" });
        const { password, email } = req.body;
        if (!password && !email)
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
        yield user.save();
        res.json({
            message: "Account updated",
            user: { id: user._id, username: user.username, email: user.email },
        });
    }
    catch (err) {
        console.error("Change password/email error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.changePassword = changePassword;
/**
 * Change password
 */
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Login required" });
        const user = yield user_model_1.User.findByIdAndDelete(userId);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (req.session) {
            req.session.userId = undefined;
            req.session.isLoggedIn = false;
        }
        res.json({ message: "Account deleted successfully" });
    }
    catch (err) {
        console.error("Delete account error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteAccount = deleteAccount;
exports.default = {
    signup: exports.signup,
    login: exports.login,
    getAccount: exports.getAccount,
    logout: exports.logout,
    changePassword: exports.changePassword,
    deleteAccount: exports.deleteAccount,
};
