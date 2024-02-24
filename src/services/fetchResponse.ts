import axios from 'axios';
import { OPENAI_RESPONSE_ENDPOINT } from './CONSTANTS';

const fetchGptResponse = async (promptText: string): Promise<string> => {
  try {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY; // Ensure this is set in your .env file and properly secured
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    const data = {
      prompt: promptText,
      temperature: 0.5,
      max_tokens: 150,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    };

    const response = await axios.post(OPENAI_RESPONSE_ENDPOINT, data, { headers });
    return response.data.choices[0].text; // Assuming you only care about the first choice.
  } catch (error) {
    console.error('Error fetching GPT-3 response:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

export default fetchGptResponse;