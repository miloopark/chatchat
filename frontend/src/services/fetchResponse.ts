import { auth } from './firebaseConfig';

const fetchGptResponse = async (promptText: string): Promise<string> => {
  
  // Check if currentUser exists before trying to call getIdToken
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }
  
  const token = await auth.currentUser.getIdToken();
  const backendUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000/api/generate-text' // Development URL
    : '/api/generate-text'; // Production URL (assuming same host and port)

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: promptText }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error fetching GPT-4 response from backend:', error);
    throw error; // Re-throw the error to handle it in the calling component
  }
};

export default fetchGptResponse;
