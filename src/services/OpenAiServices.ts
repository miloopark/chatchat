import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      "role": "user",
      "content": "tell me a joke"
    },
    {
      "role": "assistant",
      "content": "Why don't scientists trust atoms?\n\nBecause they make up everything!"
    }
  ],
  temperature: 1,
  max_tokens: 256,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
});