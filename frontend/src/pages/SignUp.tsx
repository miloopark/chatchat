import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import landingbackdrop from '../assets/landingbackdrop.svg';
import Navbar from '../components/Navbar';
import '../App.css';

const Login = () => {
    const navigate = useNavigate();
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [number, setNumber] = useState('');
    const [agreed, setAgreed] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
    };

    return (
        <div className="svg-container">
            <Navbar />
            <img src={landingbackdrop} alt="Main Background" className="backdrop" />
            <div className="login-container">
                <h1>Sign Up</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="firstname"
                        value={firstname}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                    />
                    <input
                        type="lastname"
                        value={lastname}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="Phone Number"
                        required
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        I agree with the Terms and Conditions
                    </label>
                    <button type="submit" className="create-account-button" disabled={!agreed}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;