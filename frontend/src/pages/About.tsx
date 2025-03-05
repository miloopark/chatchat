import React from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 3rem 1rem;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const HeaderSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #1a237e;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const Section = styled(motion.section)`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #3949ab 0%, #5c6bc0 100%);
  }
  
  @media (min-width: 768px) {
    padding: 3.5rem;
  }
`;

const SectionTitle = styled.h2`
  color: #3949ab;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  position: relative;
  
  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const Paragraph = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: #424242;
  font-size: 1.05rem;
`;

const FeatureList = styled.ul`
  margin-left: 1.5rem;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.li`
  margin-bottom: 1rem;
  line-height: 1.7;
  color: #424242;
  position: relative;
  padding-left: 0.5rem;
  
  strong {
    color: #1a237e;
    font-weight: 600;
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TeamMember = styled(motion.div)`
  text-align: center;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const TeamMemberName = styled.h3`
  margin-bottom: 0.5rem;
  color: #1a237e;
  font-size: 1.2rem;
  font-weight: 600;
`;

const TeamMemberRole = styled.p`
  color: #5c6bc0;
  font-size: 0.95rem;
  font-weight: 500;
`;

const ContactLink = styled.a`
  color: #5c6bc0;
  font-weight: 600;
  text-decoration: none;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: #5c6bc0;
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const About: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <HeaderSection
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.7 }}
        >
          <Title>About chat^2</Title>
        </HeaderSection>
        
        <Section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.7 }}
        >
          <SectionTitle>Our Mission</SectionTitle>
          <Paragraph>
            chat^2 is designed to aid learners who struggle with traditional educational materials by providing an immersive, 
            AI-driven visual learning experience. We believe that every child deserves a personalized education that adapts to their unique 
            learning style and needs.
          </Paragraph>
          <Paragraph>
            Our platform combines advanced AI technology with engaging 3D visualization to create an educational experience that makes 
            learning fun, accessible, and effective for all students, regardless of their learning challenges.
          </Paragraph>
        </Section>
        
        <Section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <SectionTitle>Key Features</SectionTitle>
          <FeatureList>
            <FeatureItem>
              <strong>Personalized Learning:</strong> Our AI adapts to each user's learning style and pace, providing a customized educational experience.
            </FeatureItem>
            <FeatureItem>
              <strong>Interactive 3D Visualization:</strong> Complex concepts are brought to life through immersive 3D representations, making abstract ideas concrete and understandable.
            </FeatureItem>
            <FeatureItem>
              <strong>Conversational AI:</strong> Students can ask questions and receive explanations in natural language, simulating the experience of having a personal tutor.
            </FeatureItem>
            <FeatureItem>
              <strong>Progress Tracking:</strong> Parents and educators can monitor learning progress and identify areas where additional support might be needed.
            </FeatureItem>
            <FeatureItem>
              <strong>Cross-Platform Accessibility:</strong> Access learning materials from any device, ensuring education continues beyond the classroom.
            </FeatureItem>
          </FeatureList>
        </Section>
        
        <Section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <SectionTitle>The Science Behind chat^2</SectionTitle>
          <Paragraph>
            Our approach is grounded in educational research that demonstrates the effectiveness of visual and interactive learning. 
            Studies show that animated illustrations and interactive elements significantly enhance visual processing and improve comprehension, 
            especially for complex topics.
          </Paragraph>
          <Paragraph>
            Research indicates that animated illustrations in educational content can significantly enhance children's visual processing 
            compared to static illustrations. This directed attention to relevant visual elements improves overall comprehension and retention of information.
          </Paragraph>
          <Paragraph>
            Additionally, the presence of motion and interactivity attracts and maintains attention more effectively, guiding learners 
            toward critical information and improving overall learning outcomes.
          </Paragraph>
        </Section>
        
        <Section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <SectionTitle>Our Team</SectionTitle>
          <Paragraph>
            chat^2 is developed by a dedicated team of educators, developers, and designers who share a passion for 
            making education accessible to everyone.
          </Paragraph>
          
          <TeamGrid>
            <TeamMember
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <TeamMemberName>Min Sung Park</TeamMemberName>
              <TeamMemberRole>Project Lead</TeamMemberRole>
            </TeamMember>
            <TeamMember
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <TeamMemberName>Thanh Huynh</TeamMemberName>
              <TeamMemberRole>Lead Developer</TeamMemberRole>
            </TeamMember>
            <TeamMember
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TeamMemberName>Jiehoon Lee</TeamMemberName>
              <TeamMemberRole>Frontend Engineer</TeamMemberRole>
            </TeamMember>
            <TeamMember
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TeamMemberName>Emmeline Chung</TeamMemberName>
              <TeamMemberRole>UX Designer</TeamMemberRole>
            </TeamMember>
          </TeamGrid>
        </Section>
        
        <Section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <SectionTitle>Contact Us</SectionTitle>
          <Paragraph>
            We're continually working to improve chat^2 and would love to hear your feedback. If you have any questions, 
            suggestions, or would like to learn more about our platform, please don't hesitate to get in touch with us.
          </Paragraph>
          <Paragraph>
            For general inquiries: <ContactLink href="mailto:info@chatsquared.edu">info@chatsquared.edu</ContactLink>
          </Paragraph>
        </Section>
      </ContentWrapper>
    </PageContainer>
  );
};

export default About; 