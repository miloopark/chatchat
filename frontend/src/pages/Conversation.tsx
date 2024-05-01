import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TextInput from '../components/Dashboard/TextInput';
import Avatar from '../components/Dashboard/Avatar';
import '../components/Dashboard/Transcript.css';
import landingbackdrop from '../assets/dashboardBG.svg';
import '../App.css';

const ConversationPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversationDetails, setConversationDetails] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchConversationDetails = async () => {
      try {
        const response = await fetch(`/api/conversation/${conversationId}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('idToken')}` },
        });
        if (response.ok) {
          const data = await response.json();
          setConversationDetails(data);
          setIsLoading(false); // Set loading to false when data is fetched
        } else {
          console.error('Failed to fetch conversation details');
        }
      } catch (error) {
        console.error('Error fetching conversation details:', error);
      }
    };

    fetchConversationDetails();
  }, [conversationId]);

  const handleAvatarReady = () => {
    setIsLoading(false); // Set loading to false when Avatar is ready
  };

  const handleResponseReceived = (message) => {
    console.log('Received message:', message);
  };

  const handleSpeakingChange = (speaking) => {
    setIsSpeaking(speaking);
  };

  return (
    <div className="dashboard-container">
      <img src={landingbackdrop} alt="Conversation Background" className="dash-backdrop" />
      <Button
        onClick={() => navigate(-1)} // Navigate back
        style={{
          position: 'absolute',
          top: '50px',
          left: '40px',
          zIndex: 5000, // Ensure it is higher than other elements
          color: 'white' // Ensure the button is visible against backgrounds
        }}
      >
        <ArrowBackIcon /> {/* Use the ArrowBack icon */}
      </Button>
      <div className='chat-layout'>
        {isLoading ? <div>Loading...</div> : (
          <>
            <TextInput onResponseReceived={handleResponseReceived} conversationId={conversationId} subject={conversationDetails.subject}/>
            <div className="avatar-container">
              <Avatar isSpeaking={isSpeaking} onReady={handleAvatarReady} />
            </div>
          </>
        )}
      </div>
      <div className='chat-layout'>
        <TextInput onSpeakingChange={handleSpeakingChange} onResponseReceived={handleResponseReceived} conversationId={conversationId} subject={conversationDetails.subject}/>
      </div>
    </div>
  );
}

export default ConversationPage;
