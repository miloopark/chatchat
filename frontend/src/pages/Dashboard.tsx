import React, { useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Dashboard/Sidebar';
import TextInput from '../components/Dashboard/TextInput';
import Transcript from '../components/Dashboard/Transcript';
import '../components/Dashboard/Transcript.css';
import Avatar from '../components/Dashboard/Avatar'
import landingbackdrop from '../assets/dashboardBG.svg';
import '../App.css';
import styled from "styled-components"; 
import MicButton from '../components/Dashboard/MicButton';

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
      {/* <IconButton 
        edge="start" 
        color="inherit" 
        aria-label="menu" 
        onClick={toggleSidebar}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 1201 }}
      >
        <MenuIcon />
      </IconButton> */}

      <img src={landingbackdrop} alt="Main Background" className="backdrop" />

      <div className='chat-layout'>
        <Avatar isSpeaking={isSpeaking} />
      </div>

      <div className='chat-layout'>
        <TextInput onSpeakingChange={handleSpeakingChange} />
      </div>

      {/* <div style={{ display: 'flex', position: 'relative', bottom: '49%', left: '46.5%', height: '100px', width: '100px', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
        <MicButton style={{}} />
      </div> */}

      {/* add on click event to buttons for specialized AI subjects */}

      <div style={{ display: 'flex', position: 'relative', bottom: '48.9%', left: '6.5%', height: '100px', width: '250px', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
      <Button variant="contained" style={{width: '100%', height: '55%', borderRadius: '15px', fontSize: '35px', backgroundColor: '#83ADFFE3', fontFamily: 'sans-serif'}}>Math</Button>
      </div>

      <div style={{ display: 'flex', position: 'relative', bottom: '59.75%', left: '27.5%', height: '100px', width: '250px', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
      <Button variant="contained" style={{width: '100%', height: '55%', borderRadius: '15px', fontSize: '35px', backgroundColor: '#53C350E3', fontFamily: 'sans-serif'}}>Science</Button>
      </div>

      <div style={{ display: 'flex', position: 'relative', bottom: '70.6%', left: '56.5%', height: '100px', width: '250px', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
      <Button variant="contained" style={{width: '100%', height: '55%', borderRadius: '15px', fontSize: '35px', backgroundColor: '#FF8383E3', fontFamily: 'sans-serif'}}>Reading</Button>
      </div>

      <div style={{ display: 'flex', position: 'relative', bottom: '81.25%', left: '78.5%', height: '100px', width: '250px', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
      <Button variant="contained" style={{width: '100%', height: '55%', borderRadius: '15px', fontSize: '35px', backgroundColor: '#FFAF52E3', fontFamily: 'sans-serif'}}>History</Button>
      </div>

      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default Dashboard;
