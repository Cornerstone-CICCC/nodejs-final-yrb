// src/routes/login.routes.ts
import { Router } from "express";
import authController from "../controllers/login.controller";

const router = Router();

// 회원가입
router.post("/register", authController.register);

// 로그인
router.post("/login", authController.login);

// 로그아웃
router.post("/logout", authController.logout);

export default router;
