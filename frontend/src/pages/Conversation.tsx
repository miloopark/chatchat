import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

  // Function to initiate speaking
  const speakOutLoud = (text) => {
    // Implement the function to call your backend or service here
    // Example with Axios (Assuming you have an endpoint set up):
    axios.post('/api/text-to-speech', { text }, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const audio = new Audio(url);
        audio.play();
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
      })
      .catch(error => console.error('Error speaking:', error));
  };

  useEffect(() => {
    speakOutLoud(`Hi, my name is Kevin, your bestfriend! I'm super duper good at ${conversationDetails.details.subject}! Do you need help with anything?`); // Speak when the component mounts
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div className="dashboard-container">
      <img src={landingbackdrop} alt="Conversation Background" className="dash-backdrop" />
      <Button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute',
          top: '50px',
          left: '40px',
          zIndex: 5000,
          color: 'white'
        }}
      >
        <ArrowBackIcon />
      </Button>
      <div className='chat-layout'>
        {isLoading ? <div>Loading...</div> : (
          <>
            <TextInput onResponseReceived={(message) => console.log('Received message:', message)} conversationId={conversationId} subject={conversationDetails.subject}/>
            <div className="avatar-container">
              <Avatar isSpeaking={isSpeaking} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ConversationPage;
