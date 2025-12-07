import { Router } from "express";
import userController from "../controllers/user.controller";
import { checkLogin, checkLogout } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.post("/signup", checkLogout, userController.signup);
userRouter.post("/login", checkLogout, userController.login);
userRouter.get("/account", checkLogin, userController.getAccount);
userRouter.post("/logout", checkLogin, userController.logout);
userRouter.post("/change", checkLogin, userController.changePassword);
userRouter.post("/photo", checkLogin, userController.setRobohashAvatar);

export default userRouter;
