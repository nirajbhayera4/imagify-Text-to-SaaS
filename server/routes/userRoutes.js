import { registerUser, loginUser, userCredits } from "../controllers/userController.js";
import express from "express";
import bcrypt from "bcryptjs";
import userAuth from "../middleWares/auth.js";


const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/credits", userAuth,userCredits);
export default userRouter;