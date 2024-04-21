const sendToChatGPT = async ({ prompt, conversationId, userToken }) => {
    try {
      const chatbotResponse = await fetch('api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ prompt, conversationId })
      });
  
      if (!chatbotResponse.ok) {
        const errorDetails = await chatbotResponse.text();
        throw new Error(`Chatbot API responded with status: ${chatbotResponse.status} - ${errorDetails}`);
      }
  
      const data = await chatbotResponse.json();
      return { success: true, data: data.text };
    } catch (error) {
      console.error('Error in sendToChatGPT:', error);
      return { success: false, error: error.message };
    }
  };
  
  const storeMessage = async ({ conversationId, messageText, sender, userToken }) => {
    try {
      const response = await fetch('api/store-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ conversationId, messageText, sender })
      });
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error storing message: ${response.status} - ${errorDetails}`);
      }
  
      return { success: true };
    } catch (error) {
      console.error('Error storing message:', error);
      return { success: false, error: error.message };
    }
  };
  
  export { sendToChatGPT, storeMessage };
  