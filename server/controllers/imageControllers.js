import FormData from "form-data";
import axios from "axios";
import userModel from "../models/userModel.js";
import generatedImageModel from "../models/generatedImageModel.js";

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const user = await userModel.findById(req.userId); // from middleware

    if (!user || typeof prompt !== "string" || !prompt.trim() || prompt.length > 1000) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (user.creditBalance <= 0) {
      return res.json({ success: false, message: "No credit balance left" });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API,
        },
        responseType: "arraybuffer", // important
      }
    );

    const imageBuffer = Buffer.from(data);
    const base64Image = imageBuffer.toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    const generatedImage = await generatedImageModel.create({
      userId: user._id,
      prompt: prompt.trim(),
      image: imageBuffer,
      contentType: "image/png",
    });
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: user._id, creditBalance: { $gt: 0 } },
      { $inc: { creditBalance: -1 } },
      { new: true }
    );
    if (!updatedUser) {
      await generatedImageModel.findByIdAndDelete(generatedImage._id);
      return res.json({ success: false, message: "No credit balance left", credits: 0 });
    }

    res.json({
      success: true,
      message: "Image generated successfully",
      creditBalance: updatedUser.creditBalance,
      resultImage,
      imageId: generatedImage._id,
    });
  } catch (error) {
    console.error("Image Generation Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getImageHistory = async (req, res) => {
  try {
    const images = await generatedImageModel
      .find({ userId: req.userId })
      .select("prompt contentType createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, images: images.map(({ _id, prompt, contentType, createdAt }) => ({ id: _id, prompt, contentType, createdAt })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGeneratedImage = async (req, res) => {
  try {
    const image = await generatedImageModel.findOne({ _id: req.params.id, userId: req.userId }).select("image contentType");
    if (!image) return res.status(404).json({ success: false, message: "Image not found" });
    res.json({ success: true, image: `data:${image.contentType};base64,${image.image.toString("base64")}` });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid image id" });
  }
};

export const deleteGeneratedImage = async (req, res) => {
  try {
    const image = await generatedImageModel.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!image) return res.status(404).json({ success: false, message: "Image not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid image id" });
  }
};
