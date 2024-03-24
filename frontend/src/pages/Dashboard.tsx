import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Dashboard/Sidebar'; // Adjust this path if necessary
import Navbar from '../components/Navbar';
import TextInput from '../components/Dashboard/TextInput';
import landingbackdrop from '../assets/landingbackdrop.svg';
import '../App.css';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      {/* Hamburger Menu Icon for toggling the sidebar */}
      <IconButton 
        edge="start" 
        color="inherit" 
        aria-label="menu" 
        onClick={toggleSidebar}
        style={{ position: 'absolute', top: 20, right: 20, zIndex: 1201 }} // Ensure it's above other elements
      >
        <MenuIcon />
      </IconButton>

      {/* Background image */}
      <img src={landingbackdrop} alt="Main Background" className="backdrop" />

      <div className='chat-layout'>
        <TextInput />
      </div>

      {/* Conditional rendering of Sidebar */}
      <Sidebar open={sidebarOpen} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default Dashboard;

