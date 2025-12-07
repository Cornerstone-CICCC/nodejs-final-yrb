"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const userRouter = (0, express_1.Router)();
userRouter.post("/signup", auth_middleware_1.checkLogout, user_controller_1.default.signup);
userRouter.post("/login", auth_middleware_1.checkLogout, user_controller_1.default.login);
userRouter.get("/account", auth_middleware_1.checkLogin, user_controller_1.default.getAccount);
userRouter.post("/logout", auth_middleware_1.checkLogin, user_controller_1.default.logout);
userRouter.post("/change", auth_middleware_1.checkLogin, user_controller_1.default.changePassword);
userRouter.post("/photo", auth_middleware_1.checkLogin, user_controller_1.default.setRobohashAvatar);
exports.default = userRouter;
