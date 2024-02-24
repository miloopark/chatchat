// ChatBox.tsx
import React, { useState } from 'react';

const ChatBox: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleSendRequest = async () => {
    // Placeholder for calling ChatGPT API with inputText
    // Implement your API call here
    try {
      const apiResponse = await fetch('your-chatgpt-api-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputText }),
      });

      const responseData = await apiResponse.json();
      setResponse(responseData.output);
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
    }
  };

  return (
    <div className="chat-container"> {/* Updated class name for overall container */}
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
        <button onClick={handleSendRequest}>Send M</button>
      </div>
    </div>
  );
};

export default ChatBox;

