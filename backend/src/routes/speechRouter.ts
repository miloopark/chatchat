import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/text-to-speech", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    // Explicitly return after sending the 400 status
    return res.status(400).send("Text parameter is required");
  }

  try {
    const XI_API_KEY = process.env.VITE_ELEVENLABS_API_KEY; // Ensure this is correctly set in your environment
    const VOICE_ID = "xtxNoADSfR8J98ui46Ny"; // Confirm this is correct

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      },
      {
        headers: {
          "xi-api-key": XI_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        responseType: "stream",
      },
    );

    res.setHeader("Content-Type", "audio/mpeg");
    response.data.pipe(res);
    return; // Explicit return after piping the response
  } catch (error) {
    console.error("Failed to generate speech:", error);
    // Explicitly return after sending the 500 status
    return res.status(500).send("Failed to generate speech");
  }
});

export default router;
