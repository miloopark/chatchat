import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextInput from '../components/Dashboard/TextInput';
import Avatar from '../components/Dashboard/Avatar';
import landingbackdrop from '../assets/dashboardBG.svg';
import '../App.css';

const Dashboard = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  // Handles the state change when the app starts/stops speaking
  const handleSpeakingChange = (speaking) => setIsSpeaking(speaking);

  // Handles the action after receiving a response
  const handleResponseReceived = (message) => console.log('Received message:', message);

  // Triggers the subject specific conversation
  const handleSubjectClick = async (subject) => {
    try {
        const response = await fetch('/api/conversation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('idToken')}`
            },
            body: JSON.stringify({ subject }) // Send the subject to the backend
        });

        if (response.ok) {
            const data = await response.json();
            // Navigate to the conversation page with the retrieved conversation ID
            navigate(`/conversation/${data.conversationId}`);
        } else {
            throw new Error('Failed to get or create conversation');
        }
    } catch (error) {
        console.error('Error handling subject click:', error);
    }
  };

  // Previous Design (Kept in da backburner)
  const subjects = [
    { name: 'Math', color: '#83ADFFE3' },
    { name: 'Science', color: '#53C350E3' },
    { name: 'Reading', color: '#FF8383E3' },
    { name: 'History', color: '#FFAF52E3' },
  ];

  return (
    <div className="dashboard-container">
      <img src={landingbackdrop} alt="Main Background" className="backdrop" />
      <div className='chat-layout'>
        <TextInput onResponseReceived={handleResponseReceived} />
        <div className="avatar-container">
          <Avatar isSpeaking={isSpeaking} />
        </div>
      </div>
      <div className='chat-layout'>
        <TextInput onSpeakingChange={handleSpeakingChange} />
      </div>
      <div className="button-container" style={buttonContainerStyle}>
        {subjects.map(subject => (
          <Button
            key={subject.name}
            variant="contained"
            style={{ ...buttonStyle, backgroundColor: subject.color }}
            onClick={() => handleSubjectClick(subject.name.toLowerCase())}
          >
            {subject.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

const buttonContainerStyle = {
  position: 'fixed',
  bottom: '12.5%',
  display: 'flex',
  justifyContent: 'space-around',
  width: '100%',
  zIndex: 5000
};

const buttonStyle = {
  width: '250px',
  height: '80px',
  borderRadius: '15px',
  fontSize: '35px',
  fontFamily: 'sans-serif',
  margin: '0 10px', 
};

export default Dashboard;
