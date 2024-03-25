import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Dashboard/Sidebar'; // Adjust the import path as necessary
import ChatHistory from '../components/Dashboard/ChatHistory'; // Adjust the import path as necessary
import TextInput from '../components/Dashboard/TextInput'; // Adjust the import path as necessary
import landingbackdrop from '../assets/landingbackdrop.svg';
import '../App.css';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // Assuming you want to use Menu icon for the toggle

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Starts open
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleConversationSelect = (id) => {
    setSelectedConversationId(id);
    // Optionally close the sidebar when a conversation is selected
    setSidebarOpen(false); 
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      <IconButton onClick={toggleSidebar} className="toggle-sidebar" sx={{ position: 'absolute', top: 0, right: 0 }}>
        <MenuIcon />
      </IconButton>
      <img src={landingbackdrop} alt="Main Background" className="backdrop" />
      <Sidebar open={isSidebarOpen} toggleSidebar={toggleSidebar} handleConversationSelect={handleConversationSelect} />
      <div className='chat-layout'>
        {selectedConversationId ? (
          <>
            <ChatHistory conversationId={selectedConversationId} />
            <TextInput conversationId={selectedConversationId} />
          </>
        ) : (
          <p>Select a conversation to start chatting!</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
