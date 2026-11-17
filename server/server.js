import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import imageRouter from "./routes/ImageRoutes.js";
import userRouter from "./routes/userRoutes.js";   // if you have user routes
import paymentRouter from "./routes/paymentRoutes.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // ✅ parses JSON body

// Routes
app.use("/api/image", imageRouter);  // ✅ hook image routes
app.use("/api/user", userRouter);    // if exists
app.use("/api/payment", paymentRouter);

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
