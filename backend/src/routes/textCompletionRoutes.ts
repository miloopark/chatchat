import express, { Request, Response } from "express";
import OpenAI from "openai";
import "dotenv/config";
import { fetchMessagesForConversation } from "../services/conversationService";
import { getUserData } from "../services/userService";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY as string,
});

router.post("/generate-text", async (req: Request, res: Response) => {
  const { prompt, conversationId } = req.body;
  console.log("Received conversationId:", conversationId); // Debug log

  try {
    
    // Fetch previous messages and generate context
    const messages = await fetchMessagesForConversation(conversationId);
    const conversationHistory = messages.map(msg => `${msg.sender}: ${msg.messageText}`).join('\n');
    
    // Optional: Use GPT-3.5-turbo (or another suitable model) to summarize the conversation history
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: `Summarize this conversation:\n${conversationHistory}`}],
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const summaryText = summaryResponse.choices[0].message.content;
    console.log("Conversation summary:", summaryText);

    // Combine summarized context with the new prompt
    const combinedPrompt = `Conversation summary:\n${summaryText}\n\nNew prompt:\n${prompt}`;

    // Generate response from GPT-4 using the combined prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{role: "user", content: combinedPrompt}],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    res.json({ text: response.choices[0].message.content });
  } catch (error) {
    console.error("Error in generating text from OpenAI:", error);
    res.status(500).send("Failed to generate text");
  }
});

export default router;


