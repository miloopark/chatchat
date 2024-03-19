import express, {Request, Response} from "express";
import OpenAI from "openai";
import "dotenv/config";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY as string,
});

router.post("/generate-text", async (req: Request, res: Response) => {
  const {prompt} = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.json({text: response.choices[0].message.content});
  } catch (error) {
    console.error("Error in generating text from OpenAI:", error);
    res.status(500).send("Failed to generate text");
  }
});

export default router;
