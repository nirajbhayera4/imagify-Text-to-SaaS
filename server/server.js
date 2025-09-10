import connectDB from './config/mongodb.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/userRoutes.js';
import bcrypt from "bcryptjs";


dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

app.use(express.json()); // all the requests will be in json format
app.use(cors());
await connectDB()

app.use("/api/user",userRouter);
app.get('/',(req,res)=>res.send("API working fine"));


app.listen(PORT,()=>console.log("Server is running on port "+PORT));