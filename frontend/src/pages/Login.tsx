import React from 'react';
import { useNavigate } from 'react-router-dom';
import landingbackdrop from '../assets/landingbackdrop.svg';
import Navbar from '../components/Navbar';
import '../App.css';

const Login = () => {
    const navigate = useNavigate(); /*for later navs*/

    return (
        <div className="svg-container">
            <Navbar />
            <img src={landingbackdrop} alt="Main Background" className="backdrop" />
        </div>
    );
};

export default Login;
