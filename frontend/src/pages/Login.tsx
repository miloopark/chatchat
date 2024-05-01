import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import landingbackdrop from '../assets/registration.svg';
import { signInWithGoogle, signInWithEmailPassword, sendUserDataToBackend } from '../services/authService'; // Removed signUpWithEmailPassword, sendUserDataToBackend as not used here
import Navbar from '../components/Navbar';
import '../App.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [agreed, setAgreed] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
          // Updated to reflect corrected authService function
          await signInWithEmailPassword(email, password);
          console.log("Successfully logged in");
          navigate('/home'); // Navigate upon successful login
        } catch (error) {
          console.error("Login failed: ", error);
        }
    };
    
    const handleGoogleSignIn = async () => {
        const idToken = await signInWithGoogle();
        if (!idToken) {
            console.error('Google sign-in failed or was cancelled by the user.');
            return; // Stop further execution if no token was received
        }
    
        try {
            sessionStorage.setItem('idToken', idToken);
            const response = await fetch('/api/store-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`
                },
            });
    
            if (response.ok) {
                const data = await response.json(); // Assuming the backend sends a JSON response
                if (data.firstTime) {
                    navigate('/questionnaire'); // Navigate to the questionnaire page for first-time users
                } else {
                    navigate('/navigation'); // Navigate to the dashboard for returning users
                }
            } else {
                console.error('Failed to store user data: HTTP status ', response.status);
            }
        } catch (error) {
            console.error('Error storing user data:', error);
        }
    };
    
    
      
    
    return (
        <div className="svg-container">
            <img src={landingbackdrop} alt="Main Background" className="fit-backdrop" />
            <div className="login-container">
                <h1>Log In</h1>
                <button onClick={handleGoogleSignIn} className="google-login-button">
                    Continue with Google
                </button>
                <div className="divider">or</div>
                <form onSubmit={handleLogin}>
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
                    <label>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        I agree with the Terms and Conditions
                    </label>
                    <button type="submit" className="create-account-button" disabled={!agreed}>
                        Log In
                    </button>
                </form>
                <button onClick={() => navigate('/signup')} className="create-account-button">
                    Sign Up
                </button>
            </div>
        </div>
    );
};

export default Login;