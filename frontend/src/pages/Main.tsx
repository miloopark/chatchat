import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';
import landingbackdrop from '../assets/landing.svg';
import sourcegraph1 from '../assets/sourcegraph1.png';
import sourcegraph2 from '../assets/sourcegraph2.png';
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
            <div className = "research-container">
            <span style={{ textDecoration: 'underline' }}>1. Animated vs. Static Storybooks: </span>
            <br />
            Research indicates that animated illustrations in storybooks, specifically those incorporating motion, can significantly enhance children's visual processing compared to static illustrations. This suggests a potential for better story comprehension through directed attention to story-relevant parts of illustrations. <br />
            <br />
            <span style={{ textDecoration: 'underline' }}>2. Effect on Learners' Motivation: </span>
            <br />
            The presence of motion in illustrations was found to attract children's attention effectively, guiding them towards parts of the illustration critical for understanding the story. This mechanism may explain the observed improvement in story comprehension with animated books.
            </div>
            <div className = "research-source">
                <img src={sourcegraph1} alt="Descriptive Text" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                <p style={{ fontSize: 'small', textIndent: '10px', marginTop: '4px' }}>
                Barut Tugtekin E, Dursun OO. Effect of animated and interactive video variations on learners' motivation in distance Education. 
                Educ Inf Technol (Dordr). 2022;27(3):3247-3276. doi: 10.1007/s10639-021-10735-5. Epub 2021 Sep 16. PMID: 34548839; PMCID: PMC8444525.
                </p>
                <img src={sourcegraph2} alt="Descriptive Text" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                <p style={{ fontSize: 'small', textIndent: '10px', marginTop: '4px' }}>
                Takacs ZK, Bus AG. Benefits of Motion in Animated Storybooks for Children's Visual Attention and Story Comprehension. 
                An Eye-Tracking Study. Front Psychol. 2016 Oct 13;7:1591. doi: 10.3389/fpsyg.2016.01591. PMID: 27790183; PMCID: PMC5062825.
                </p>
            </div>
        </div>
    );
};

export default Main;
