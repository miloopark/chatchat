import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import landingbackdrop from '../assets/landing.svg';
import Navbar from '../components/Navbar';
import '../App.css';

const Main = () => {
    const navigate = useNavigate();

    return (
        <div className="svg-container">
            <img src={landingbackdrop} alt="Main Background" className="backdrop" />
            <div className="landingtext">
                <h1>
                Learn, Laugh, and Grow <br />
                    <span style={{ color: 'black' }}>
                        <Typewriter
                            words={['with Every Chat']}
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
                Our app offers a unique blend of fun and education, where kids can engage with an interactive <br /> character that guides them through educational content.
                It’s like an imaginary friend who's <br /> always there to teach something new, encourage curiosity, and share laughs along the way!
                </div>
                <button onClick={() => navigate('/login')} className="get-started-button">
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default Main;
