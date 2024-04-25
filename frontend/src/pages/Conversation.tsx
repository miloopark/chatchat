import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TextInput from '../components/Dashboard/TextInput';
import Avatar from '../components/Dashboard/Avatar';
import '../components/Dashboard/Transcript.css';
import landingbackdrop from '../assets/dashboardBG.svg';
import '../App.css';

interface ConversationData {
  userId?: string;
  lastMessagePreview?: string;
  lastUpdated?: Date;
  createdAt?: Date;
  subject?: string;
}

const ConversationPage = () => {
  const { conversationId } = useParams();
  const [conversationDetails, setConversationDetails] = useState<ConversationData>({});;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const fetchConversationDetails = async () => {
      try {
        const response = await fetch(`/api/conversation/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('idToken')}` },
        });
        if (response.ok) {
          const data = await response.json();
          setConversationDetails(data);
        } else {
          console.error('Failed to fetch conversation details');
        }
      } catch (error) {
        console.error('Error fetching conversation details:', error);
      }
    };

    fetchConversationDetails();
  }, [conversationId]);

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
        {/* Pass the entire conversationDetails object or specific properties as needed */}
        <TextInput onResponseReceived={handleResponseReceived} conversationId={conversationId} subject={conversationDetails.subject}/>
        <div className="avatar-container">
          <Avatar isSpeaking={isSpeaking} />
        </div>
      </div>

      <div className='chat-layout'>
        <TextInput onSpeakingChange={handleSpeakingChange} onResponseReceived={handleResponseReceived} conversationId={conversationId} subject={conversationDetails.subject}/>
      </div>

      {/* Optionally, add additional UI components here */}
    </div>
  );
}

export default ConversationPage;
