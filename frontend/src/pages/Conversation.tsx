import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TextInput from '../components/Dashboard/TextInput';
import Avatar from '../components/Dashboard/Avatar';
import '../components/Dashboard/Transcript.css';
import landingbackdrop from '../assets/dashboardBG.svg';
import '../App.css';

const ConversationPage = () => {
  const { conversationId } = useParams(); // This retrieves the conversation ID from the URL
  console.log('Conversation ID:', conversationId);
  //const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);


  const handleResponseReceived = (message) => {
    console.log('Received message:', message);
    // Optionally update the UI or state with the new message
  };

  const handleSpeakingChange = (speaking) => {
    setIsSpeaking(speaking);
  };

  return (
    <div className="dashboard-container">
      <img src={landingbackdrop} alt="Conversation Background" className="backdrop" />

      <div className='chat-layout'>
        <TextInput onResponseReceived={handleResponseReceived} conversationId={conversationId}/>
        <div className="avatar-container">
          <Avatar isSpeaking={isSpeaking} />
        </div>
      </div>

      <div className='chat-layout'>
        <TextInput onSpeakingChange={handleSpeakingChange} onResponseReceived={handleResponseReceived} conversationId={conversationId} />
      </div>

      {/* Optionally, add additional UI components here */}
    </div>
  );
}

export default ConversationPage;
