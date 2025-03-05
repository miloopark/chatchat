import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import { useAuth } from '../contexts/authProvider';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// Styled components for the redesigned landing page
const HomeWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 85vh;
  padding: 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(92,107,192,0.2) 0%, rgba(92,107,192,0) 70%);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10%;
    left: -10%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(92,107,192,0.2) 0%, rgba(92,107,192,0) 70%);
    z-index: 0;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  z-index: 1;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #1a237e;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  margin-bottom: 3rem;
  color: #424242;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

const PrimaryButton = styled(motion.div)`
  a {
    display: inline-block;
    background: linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%);
    color: white;
    font-weight: 600;
    padding: 0.9rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(92, 107, 192, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 25px rgba(92, 107, 192, 0.4);
    }
  }
`;

const SecondaryButton = styled(motion.div)`
  a {
    display: inline-block;
    background: white;
    color: #3949ab;
    font-weight: 600;
    padding: 0.9rem 2rem;
    border-radius: 50px;
    text-decoration: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
`;

const FeaturesSection = styled.section`
  padding: 5rem 2rem;
  background: white;
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  color: #1a237e;
  margin-bottom: 3rem;
  font-weight: 700;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled(motion.div)`
  background: #f8f9fa;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
  
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

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  color: #3949ab;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: #616161;
  line-height: 1.6;
`;

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <HomeWrapper>
      <HeroSection>
        <ContentContainer>
          <Title
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Welcome to chat^2
          </Title>
          <Subtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            chat^2 is your personal AI learning assistant that makes learning interactive, engaging, and tailored to your unique needs.
          </Subtitle>
          
          <ButtonGroup
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {currentUser ? (
              <PrimaryButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/dashboard">Go to Dashboard</Link>
              </PrimaryButton>
            ) : (
              <>
                <SecondaryButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login">Log In</Link>
                </SecondaryButton>
                <PrimaryButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/signup">Sign Up</Link>
                </PrimaryButton>
              </>
            )}
          </ButtonGroup>
        </ContentContainer>
      </HeroSection>

      <FeaturesSection>
        <ContentContainer>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Why Choose chat^2?
          </SectionTitle>
          
          <FeaturesGrid>
            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <FeatureTitle>Personalized Learning</FeatureTitle>
              <FeatureDescription>
                Our AI adapts to your learning style and preferences, creating a customized educational experience that evolves with you.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <FeatureTitle>Interactive Conversations</FeatureTitle>
              <FeatureDescription>
                Engage in natural, meaningful dialogues with our AI that make learning more conversational and less like traditional studying.
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <FeatureTitle>Educational Focus</FeatureTitle>
              <FeatureDescription>
                Every aspect of chat^2 is designed with learning in mind, delivering age-appropriate content that aligns with educational standards.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </ContentContainer>
      </FeaturesSection>
    </HomeWrapper>
  );
};

export default Home; 