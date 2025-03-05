import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
import { signUpWithEmailPassword, signInWithGoogle } from '../services/authService';

// Main container with gradient background
const SignUpContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(92,107,192,0.1) 0%, rgba(92,107,192,0) 70%);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -200px;
    left: -200px;
    width: 600px;
    height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(92,107,192,0.1) 0%, rgba(92,107,192,0) 70%);
    z-index: 0;
  }
`;

// Styled card for sign up form
const SignUpCard = styled(motion.div)`
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%);
  }
`;

// Card header with gradient
const SignUpHeader = styled.div`
  padding: 2.5rem 2.5rem 1.5rem;
  text-align: center;
`;

// Main title
const SignUpTitle = styled.h2`
  color: #1a237e;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

// Subtitle
const SignUpSubtitle = styled.p`
  color: #757575;
  font-size: 1rem;
  margin-bottom: 0;
`;

// Form container
const FormContainer = styled.div`
  padding: 0 2.5rem 2.5rem;
`;

// Google button with icon
const GoogleButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  background-color: white;
  color: #424242;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  
  &:hover {
    background-color: #f5f5f5;
    border-color: #d0d0d0;
  }
  
  svg {
    margin-right: 12px;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Divider for "or" section
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &::before, &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #e0e0e0;
  }
  
  span {
    padding: 0 1rem;
    color: #9e9e9e;
    font-size: 0.9rem;
  }
`;

// Form element
const SignUpForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Input group
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

// Row for name fields
const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// Label
const InputLabel = styled.label`
  color: #424242;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
`;

// Text input
const Input = styled.input`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #5c6bc0;
    box-shadow: 0 0 0 2px rgba(92, 107, 192, 0.2);
  }
`;

// Checkbox container
const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  gap: 10px;
`;

// Styled checkbox
const StyledCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin: 0;
`;

// Terms text
const TermsText = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  
  a {
    color: #2196f3;
    text-decoration: none;
    margin: 0 4px;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Submit button
const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    box-shadow: 0 6px 15px rgba(92, 107, 192, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: linear-gradient(90deg, #9fa8da 0%, #c5cae9 100%);
    box-shadow: none;
  }
`;

// Error message
const ErrorMessage = styled(motion.div)`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

// Bottom links/text
const BottomText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: #616161;
  
  a {
    color: #3949ab;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.2 } }
};

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await signUpWithEmailPassword(email, password, `${firstName} ${lastName}`);
      navigate("/questionnaire");
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      console.log('Google sign-in successful:', result);
      
      // Check if this is a new user
      if (result.isNewUser) {
        navigate('/questionnaire');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignUpContainer
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <SignUpCard variants={cardVariants}>
        <SignUpHeader>
          <SignUpTitle>Join chat^2</SignUpTitle>
          <SignUpSubtitle>Join us to start your personalized learning experience</SignUpSubtitle>
        </SignUpHeader>
        
        <FormContainer>
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </ErrorMessage>
          )}
          
          <GoogleButton
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
            </svg>
            Continue with Google
          </GoogleButton>
          
          <Divider>
            <span>or</span>
          </Divider>
          
          <SignUpForm onSubmit={handleSubmit}>
            <NameRow>
              <InputGroup>
                <InputLabel htmlFor="firstName">First Name</InputLabel>
                <Input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter first name"
                />
              </InputGroup>
              
              <InputGroup>
                <InputLabel htmlFor="lastName">Last Name</InputLabel>
                <Input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter last name"
                />
              </InputGroup>
            </NameRow>
            
            <InputGroup>
              <InputLabel htmlFor="email">Email Address</InputLabel>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </InputGroup>
            
            <InputGroup>
              <InputLabel htmlFor="password">Password</InputLabel>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimum 8 characters"
                minLength={8}
              />
            </InputGroup>
            
            <InputGroup>
              <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
              <Input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
              />
            </InputGroup>
            
            <CheckboxGroup>
              <StyledCheckbox
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <TermsText htmlFor="terms">
                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </TermsText>
            </CheckboxGroup>
            
            <SubmitButton 
              type="submit" 
              disabled={!agreeToTerms || isLoading}
              whileHover={agreeToTerms ? { scale: 1.02 } : {}}
              whileTap={agreeToTerms ? { scale: 0.98 } : {}}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </SubmitButton>
          </SignUpForm>
          
          <BottomText>
            Already have an account? <Link to="/login">Log In</Link>
          </BottomText>
        </FormContainer>
      </SignUpCard>
    </SignUpContainer>
  );
};

export default SignUp;
