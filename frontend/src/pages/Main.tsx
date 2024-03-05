// Main.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import landingbackdrop from '../assets/landingbackdrop.svg';
import Navbar from '../components/Navbar';
import '../App.css';

const Main = () => {
    const navigate = useNavigate();

    return (
        <div className="svg-container">
            <Navbar />
            <img src={landingbackdrop} alt="Main Background" className="backdrop" />
            <div className="landingtext">
                <h1>
                    AI you can chat with, <br />
                    <span style={{ color: 'black' }}>
                        <Typewriter
                            words={['face-to-[a] face']}
                            loop={0}
                            cursor
                            cursorStyle='_'
                            typeSpeed={100}
                            deleteSpeed={150}
                            delaySpeed={1000}
                        />
                    </span>
                </h1>
                <div className="subtitle">
                    Customize your avatar and ask them a question, generate a gripping story, or <br /> just talk about your day: the text box is your oyster.
                </div>
                <button onClick={() => navigate('/login')} className="get-started-button">
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default Main;
