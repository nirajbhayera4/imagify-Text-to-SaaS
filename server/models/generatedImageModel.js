import mongoose from "mongoose";

const generatedImageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    prompt: { type: String, required: true, trim: true, maxlength: 1000 },
    image: { type: Buffer, required: true },
    contentType: { type: String, default: "image/png" },
  },
  { timestamps: true }
);

export default mongoose.models.GeneratedImage || mongoose.model("GeneratedImage", generatedImageSchema);
