import React, { useState, useEffect } from 'react';
import landingbackdrop from '../assets/landingbackdrop.svg';
import Navbar from '../components/Navbar';
import TextInput from '../components/Dashboard/TextInput';
import '../App'; 
import '../App.css'; 

const Home = () => {


  return (
    <div className="dashboard-container">
      <Navbar />
      <img src={landingbackdrop} alt="Main Background" className="backdrop" />
      <div className='chat-layout'>
        <TextInput />
      </div>
    </div>
  );
}

export default Home;
