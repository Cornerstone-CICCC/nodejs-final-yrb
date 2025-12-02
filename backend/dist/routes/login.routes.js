"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/login.routes.ts
const express_1 = require("express");
const login_controller_1 = __importDefault(require("../controllers/login.controller"));
const router = (0, express_1.Router)();
// 회원가입
router.post("/register", login_controller_1.default.register);
// 로그인
router.post("/login", login_controller_1.default.login);
// 로그아웃
router.post("/logout", login_controller_1.default.logout);
exports.default = router;
