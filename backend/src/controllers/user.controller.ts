import { Request, Response } from "express";
import { User } from "../models/user.model";

/**
 * Sign up (add user)
 */
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await User.create({ username, email, password });

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
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Log in (check user)
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username or password missing" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await user.comparePassword(password);
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
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get user account
 */
export const getAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Login required" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Get account error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Logout
 */
export const logout = (req: Request, res: Response) => {
  if (req.session) {
    req.session.userId = undefined;
    req.session.isLoggedIn = false;
  }
  res.status(200).json({ message: "Logout successful!" });
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Login required" });

    const { password, email } = req.body;
    if (!password && !email)
      return res.status(400).json({ message: "Nothing to update" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (password) user.password = password;

    await user.save();

    res.json({
      message: "Account updated",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Change password/email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Change password
 */
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Login required" });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.session) {
      req.session.userId = undefined;
      req.session.isLoggedIn = false;
    }

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  signup,
  login,
  getAccount,
  logout,
  changePassword,
  deleteAccount,
};
