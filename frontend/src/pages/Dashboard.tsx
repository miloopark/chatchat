import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextInput from '../components/Dashboard/TextInput';
import '../components/Dashboard/Transcript.css';
import Avatar from '../components/Dashboard/Avatar'
import landingbackdrop from '../assets/dashboardBG.svg';
import '../App.css';
//import styled from "styled-components"; 
//import MicButton from '../components/Dashboard/MicButton';

const Dashboard = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleSpeakingChange = (speaking) => {
    setIsSpeaking(speaking);
  };

  const handleResponseReceived = (message) => {
    console.log('Received message:', message)
  };

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

      {/* <div style={{ display: 'flex', position: 'relative', bottom: '49%', left: '46.5%', height: '100px', width: '100px', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
        <MicButton style={{}} />
      </div> */}

      {/* add on click event to buttons for specialized AI subjects */}

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '6.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#83ADFFE3', 
          fontFamily: 'sans-serif'
          }}>
            Math
          </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '27.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#53C350E3', 
          fontFamily: 'sans-serif'
          }}>
            Science
          </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '56.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#FF8383E3', 
          fontFamily: 'sans-serif'
          }}>
            Reading
          </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '78.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#FFAF52E3', 
          fontFamily: 'sans-serif'
          }}>
            History
          </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '6.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#83ADFFE3', 
          fontFamily: 'sans-serif'
          }} onClick={() =>handleSubjectClick('math')}>
            Math
          </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '27.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#53C350E3', 
          fontFamily: 'sans-serif'
          }} onClick={() =>handleSubjectClick('science')}>
            Science
          </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '56.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#FF8383E3', 
          fontFamily: 'sans-serif'
          }} onClick={() =>handleSubjectClick('reading')}>
            Reading
          </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        position: 'fixed', 
        bottom: '9.5%', 
        left: '78.5%', 
        height: '100px', 
        width: '250px', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 5000 
        }}>
        <Button variant="contained" style={{
          width: '100%', 
          height: '55%', 
          borderRadius: '15px', 
          fontSize: '35px', 
          backgroundColor: '#FFAF52E3', 
          fontFamily: 'sans-serif'
          }} onClick={() =>handleSubjectClick('history')}>
            History
          </Button>
      </div>

    </div>
  );
}

const buttonStyle = {
  width: '100%',
  height: '55%',
  borderRadius: '15px',
  fontSize: '35px',
  backgroundColor: '#83ADFFE3',
  fontFamily: 'sans-serif'
};

export default Dashboard;