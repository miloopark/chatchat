// Dashboard.jsx
import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Dashboard/Sidebar';
import TextInput from '../components/Dashboard/TextInput';
import Avatar from '../components/Dashboard/Avatar'
import landingbackdrop from '../assets/landingbackdrop.svg';
import '../App.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSpeakingChange = (speaking) => {
    setIsSpeaking(speaking);
  };

  return (
    <div className="dashboard-container">
      <IconButton 
        edge="start" 
        color="inherit" 
        aria-label="menu" 
        onClick={toggleSidebar}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 1201 }}
      >
        <MenuIcon />
      </IconButton>

      <img src={landingbackdrop} alt="Main Background" className="backdrop" />

      <div className='chat-layout'>
        <Avatar isSpeaking={isSpeaking} />
      </div>

      <div className='chat-layout'>
        <TextInput onSpeakingChange={handleSpeakingChange} />
      </div>

      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default Dashboard;
