import React, { useState, useEffect } from 'react';
import './ChatBox.css'; 
import fetchGptResponse from './services/fetchGPTResponse';
import annyang from 'annyang'; 

interface ChatBoxProps {
  onMessageSend: (input: string, response: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ onMessageSend }) => {
  const [inputText, setInputText] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    if (annyang) {
      const commands: { [command: string]: Function } = {
        '*text': (text: string) => {
          setInputText(text);
        },
      };

      annyang.addCommands(commands);

      if (isListening) {
        annyang.start({ autoRestart: true, continuous: false });
      } else {
        annyang.abort();
      }

      return () => {
        if (annyang) {
          annyang.abort();
        }
      };
    }
  }, [isListening]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleSendRequest = async () => {
    if (!inputText.trim()) return; // Early return if inputText is empty or only whitespace
    
    setResponse("Fetching response..."); // Optional: set a loading state
    try {
      const apiResponse = await fetchGptResponse(inputText);
      if (apiResponse !== null) {
        setResponse(apiResponse); // Update the state with the response
        onMessageSend(inputText, apiResponse);
      } else {
        setResponse("Received no response from the API."); // Handle the null case
      }
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      setResponse("Failed to fetch response."); // Display an error message
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="chat-box-container">
      <div className="response-box">
        {response ? response : "Awaiting response..."}
      </div>
      <div className="input-send-container">
        <textarea
          className="input-text-box"
          value={inputText}
          onChange={handleInputChange}
          rows={4}
        />
        <button className="listen-button" onClick={toggleListening}>
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
        <button className="send-button" onClick={handleSendRequest}>Send</button>
      </div>
    </div>
  );
};


export default ChatBox;
