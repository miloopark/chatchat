// ChatBox.tsx
import React, { useState } from 'react';
import fetchGptResponse from './services/fetchResponse';

const ChatBox: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleSendRequest = async () => {
    if (!inputText.trim()) return; // Early return if inputText is empty or only whitespace
    setResponse("Fetching response..."); // Optional: set a loading state

    try {
      const apiResponse = await fetchGptResponse(inputText);
      setResponse(apiResponse); // Update the state with the response from the fetchGptResponse function
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      setResponse("Failed to fetch response."); // Display an error message
    }
  };

  return (
    <div className="chat-container">
      <div className="response-box">
        {response ? response : "Awaiting response..."}
      </div>
      <div className="input-send-container">
        <textarea
          className="input-text-box"
          value={inputText}
          onChange={handleInputChange}
          rows={4}
          cols={50}
        />
        <button onClick={handleSendRequest}>Send</button> {/* Corrected the onClick handler to use handleSendRequest */}
      </div>
    </div>
  );
};

export default ChatBox;