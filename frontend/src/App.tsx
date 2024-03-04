import { useState, useEffect } from 'react';
import ChatBox from './ChatBox';
import ChatHistory from './components/ChatHistory';
import './App.css';

interface IMessage {
  input: string;
  response: string;
}

function App() {
  
  const [messages, setMessages] = useState<IMessage[]>(() => {
    const savedMessages = sessionStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  /*
  const [messages, setMessages] = useState<IMessage[]>([]);
  */
 
  const addMessage = (input: string, response: string) => {
    setMessages((prevMessages) => [...prevMessages, { input, response }]);
  };
  

  return (
    <div className="app-container">
      <h1 className="chat-title">CHAT CHAT</h1>
      <div className='chat-layout'>
        <ChatHistory messages={messages} />
        <ChatBox onMessageSend={addMessage} />
      </div>
    </div> 
  );
}

export default App;
