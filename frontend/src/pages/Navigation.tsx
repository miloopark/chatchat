import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
 
const Navigation = () => {
  const navigate = useNavigate();

  // Function to handle the start of each subject conversation
  const startConversation = async (subject) => {
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('idToken')}`
        },
        body: JSON.stringify({ subject })
      });
      const data = await response.json();
      if (response.ok) {
        navigate(`/conversation/${data.conversationId}`);
      } else {
        throw new Error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <Button
          style={{ ...buttonStyle, backgroundColor: '#4E79A7' }}
          onClick={() => startConversation('math')}>
          Math
        </Button>
        <Button
          style={{ ...buttonStyle, backgroundColor: '#F28E2B' }}
          onClick={() => startConversation('reading')}>
          Reading
        </Button>
      </div>
      <div style={rowStyle}>
        <Button
          style={{ ...buttonStyle, backgroundColor: '#59A14F' }}
          onClick={() => startConversation('science')}>
          Science
        </Button>
        <Button
          style={{ ...buttonStyle, backgroundColor: '#E15759' }}
          onClick={() => startConversation('history')}>
          History
        </Button>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'grid',
  gridTemplateRows: '1fr 1fr',
  gridTemplateColumns: '1fr 1fr',
  height: '100vh',
  width: '100vw',
  gap: '10px',
  padding: '10px',
  boxSizing: 'border-box',
};

const rowStyle = {
  display: 'contents',
};

const buttonStyle = {
  width: '100%',
  height: '100%',
  fontSize: 'calc(1.5rem + 1vw)',
  color: '#FFFFFF',
  borderRadius: '15px',
  textTransform: 'none',
  boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
};

export default Navigation;
