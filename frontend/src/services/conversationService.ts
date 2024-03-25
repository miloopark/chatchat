import { auth } from './firebaseConfig';

const fetchGptResponseAndPostConversation = async (userInput: string, conversationId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const token = await auth.currentUser.getIdToken();

  // Assuming you're running the backend and frontend on the same host but different ports
  // and that the backend handles CORS correctly
  const gptUrl = `${process.env.REACT_APP_BACKEND_URL}/api/generate-text`; 
  const conversationUrl = `${process.env.REACT_APP_BACKEND_URL}/api/conversation`;

  try {
    // Fetch GPT response
    const gptResponse = await fetch(gptUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userInput }),
    });

    if (!gptResponse.ok) {
      throw new Error('Failed to get response from GPT');
    }

    const gptData = await gptResponse.json();

    // Post conversation update to the backend
    await fetch(conversationUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        message: gptData.text, // Your backend expects `message`, not `messages`
      }),
    });

  } catch (error) {
    console.error('Error in conversation service:', error);
    throw error; // Re-throw to handle in the component
  }
};

export default fetchGptResponseAndPostConversation;
