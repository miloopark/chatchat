import OpenAI from 'openai';

// Instantiate OpenAI with your API key
// Make sure that VITE_OPENAI_API_KEY is defined in your .env file
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  dangerouslyAllowBrowser: true
});

const fetchGptResponse = async (promptText: string) => {
  try {
    // The SDK handles the headers and the endpoint for you
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: promptText }], // Make sure to match the expected format for messages
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // The response format might differ, you will need to adjust the following line according to the actual response structure
    return response.choices[0].message.content; // Adjust this line based on the actual response structure
  } catch (error) {
    console.error('Error fetching GPT-4 response:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export default fetchGptResponse;
