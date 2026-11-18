import express from "express"
import userAuth from "../middleWares/auth.js"
import {generateImage, getImageHistory, getGeneratedImage, deleteGeneratedImage} from "../controllers/imageControllers.js"
const imageRouter=express.Router()

imageRouter.post("/generate-image",userAuth,generateImage
);
imageRouter.get("/history", userAuth, getImageHistory);
imageRouter.get("/history/:id", userAuth, getGeneratedImage);
imageRouter.delete("/history/:id", userAuth, deleteGeneratedImage);
export default imageRouter
