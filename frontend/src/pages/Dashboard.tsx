import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Dashboard/Sidebar'; 
import Navbar from '../components/Navbar';
import TextInput from '../components/Dashboard/TextInput';
import Transcript from '../components/Dashboard/Transcript';
import '../components/Dashboard/Transcript.css';
import Avatar from '../components/Dashboard/Avatar'
import landingbackdrop from '../assets/landingbackdrop.svg';
import '../App.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

    // New method to handle the GPT API response
    const handleResponseReceived = (message) => {
      setTranscript(message);
    };

  return (
    <div className="dashboard-container">
      <Navbar />
      <IconButton 
        edge="start" 
        color="inherit" 
        aria-label="menu" 
        onClick={toggleSidebar}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 1201 }} // Ensure it's above other elements
      >
        <MenuIcon />
      </IconButton>

      <img src={landingbackdrop} alt="Main Background" className="backdrop" />

      <div className='chat-layout'>
        <TextInput onResponseReceived={handleResponseReceived} />
        <div className="avatar-container">
          <Avatar transcript={transcript} />
        </div>
      </div>

      {/* Conditional rendering of Sidebar */}
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default Dashboard;

