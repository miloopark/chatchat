import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true
});

const fetchGptResponse = async (promptText: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: promptText }],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching GPT-4 response:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export default fetchGptResponse;
