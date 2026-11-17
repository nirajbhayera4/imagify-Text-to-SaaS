import express from "express";
import userAuth from "../middleWares/auth.js";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const paymentRouter = express.Router();
paymentRouter.post("/create-order", userAuth, createOrder);
paymentRouter.post("/verify", userAuth, verifyPayment);

export default paymentRouter;
