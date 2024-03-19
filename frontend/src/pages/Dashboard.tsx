import React, { useState, useEffect } from 'react';
import landingbackdrop from '../assets/landingbackdrop.svg';
import Navbar from '../components/Navbar';
import '../App'; 
import '../App.css'; 

const Home = () => {


  return (
    <div className="svg-container">
      <Navbar />
      <img src={landingbackdrop} alt="Main Background" className="backdrop" />
      <div className='chat-layout'>
      </div>
    </div>
  );
}

export default Home;
