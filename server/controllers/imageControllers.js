import FormData from "form-data";
import axios from "axios";
import userModel from "../models/userModel.js";

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const user = await userModel.findById(req.userId); // from middleware

    if (!user || !prompt) {
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

    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    res.json({
      success: true,
      message: "Image generated successfully",
      creditBalance: user.creditBalance - 1,
      resultImage,
    });
  } catch (error) {
    console.error("Image Generation Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
