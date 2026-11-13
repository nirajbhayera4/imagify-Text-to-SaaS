import express from "express"
import userAuth from "../middleWares/auth.js"
import {generateImage} from "../controllers/imageControllers.js"
const imageRouter=express.Router()

imageRouter.post("/generate-image",userAuth,generateImage
);
export default imageRouter