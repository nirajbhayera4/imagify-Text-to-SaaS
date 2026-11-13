import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import imageRouter from "./routes/imageRoutes.js"; // ✅ import your router
import userRouter from "./routes/userRoutes.js";   // if you have user routes

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // ✅ parses JSON body

// Routes
app.use("/api/image", imageRouter);  // ✅ hook image routes
app.use("/api/user", userRouter);    // if exists

// Root check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Server start
const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
