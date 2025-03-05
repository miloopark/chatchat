import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import "survey-core/defaultV2.min.css";
import { json } from './surveyJSON';
import { saveQuestionnaireResponses, hasCompletedQuestionnaire, getQuestionnaireResponses, QuestionnaireData } from '../../services/questionnaireService';
import { useAuth } from '../../contexts/authProvider';
import styled from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { COLLECTIONS } from '../../services/CONSTANTS';
import "./Questionnaire.css";

const QuestionnaireContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const ErrorMessage = styled.div`
  color: red;
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid red;
  border-radius: 5px;
  background-color: #ffeeee;
`;

// Debug function to verify data was saved
const verifyDataSaved = async (userId: string) => {
  try {
    console.log('Verifying data was saved for user:', userId);
    
    // Check user document status
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('User document exists with data:', userDoc.data());
      console.log('hasCompletedQuestionnaire:', userDoc.data().hasCompletedQuestionnaire);
    } else {
      console.error('User document does not exist!');
    }
    
    // Check questionnaire document
    const questionnaireRef = doc(db, COLLECTIONS.QUESTIONNAIRES, userId);
    const questionnaireDoc = await getDoc(questionnaireRef);
    
    if (questionnaireDoc.exists()) {
      console.log('Questionnaire document exists with data:', questionnaireDoc.data());
      console.log('Responses:', questionnaireDoc.data().responses);
      return true;
    } else {
      console.error('Questionnaire document does not exist!');
      return false;
    }
  } catch (error) {
    console.error('Error verifying saved data:', error);
    return false;
  }
};

// Define our survey JSON
const surveyJson = {
  title: "Help Us Personalize Your Learning Experience",
  description: "This information helps your AI assistant understand how to best support your learning journey.",
  logo: "https://api.surveyjs.io/private/Surveys/files?name=56901429-50f2-4ab9-a1ac-8f66eb2c6ac8",
  logoPosition: "right",
  logoWidth: "140px",
  logoHeight: "35px",
  completedHtml: "<h3>Thank you for completing the questionnaire!</h3><p>Your AI assistant will now be personalized to your learning style and preferences.</p>",
  pages: [
    {
      name: "basicInfo",
      title: "About You",
      elements: [
        {
          type: "text",
          name: "name",
          title: "What should we call you?",
          isRequired: true,
          placeHolder: "Your name"
        },
        {
          type: "dropdown",
          name: "academicLevel",
          title: "Your current academic level:",
          isRequired: true,
          choices: [
            { value: "Elementary", text: "Elementary School" },
            { value: "MiddleSchool", text: "Middle School" },
            { value: "HighSchool", text: "High School" },
            { value: "College", text: "College/University" },
            { value: "Graduate", text: "Graduate School" },
            { value: "Professional", text: "Professional" },
            { value: "Other", text: "Other" }
          ]
        },
        {
          type: "dropdown",
          name: "learningStyle",
          title: "How do you prefer to learn new information?",
          isRequired: true,
          choices: [
            { value: "Visual", text: "Visual (images, diagrams, videos)" },
            { value: "Auditory", text: "Auditory (hearing explanations, discussions)" },
            { value: "ReadingWriting", text: "Reading/Writing (text, notes, articles)" },
            { value: "Kinesthetic", text: "Kinesthetic (hands-on activities, practice)" },
            { value: "Mixed", text: "Mixed (combination of methods)" }
          ]
        }
      ]
    },
    {
      name: "interests",
      title: "Your Interests & Challenges",
      elements: [
        {
          type: "tagbox",
          name: "interests",
          title: "Select topics you're interested in (select all that apply):",
          isRequired: true,
          choices: [
            "Technology",
            "Science",
            "Math",
            "Literature",
            "History",
            "Arts",
            "Music",
            "Sports",
            "Gaming",
            "Nature",
            "Space",
            "Cooking",
            "Languages",
            "Coding",
            "Business",
            "Engineering",
            "Medicine",
            "Psychology",
            "Environment",
            "Politics"
          ]
        },
        {
          type: "comment",
          name: "otherInterests",
          title: "Any other specific interests not listed above?",
          placeHolder: "I'm also interested in..."
        },
        {
          type: "tagbox",
          name: "challenges",
          title: "Which areas do you find challenging? (select all that apply)",
          choices: [
            "Understanding complex concepts",
            "Memorizing information",
            "Staying focused/motivated",
            "Managing time effectively",
            "Test-taking anxiety",
            "Creative thinking",
            "Critical thinking",
            "Writing clearly",
            "Math calculations",
            "Reading comprehension",
            "Public speaking",
            "Group work"
          ]
        }
      ]
    },
    {
      name: "subjectPreferences",
      title: "Subject Preferences",
      description: "Rate your interest level in these subjects (1 = Low interest, 5 = High interest)",
      elements: [
        {
          type: "rating",
          name: "subjectPreferences.Math",
          title: "Mathematics",
          rateMin: 1,
          rateMax: 5
        },
        {
          type: "rating",
          name: "subjectPreferences.Science",
          title: "Science",
          rateMin: 1,
          rateMax: 5
        },
        {
          type: "rating",
          name: "subjectPreferences.Language",
          title: "Language & Literature",
          rateMin: 1,
          rateMax: 5
        },
        {
          type: "rating",
          name: "subjectPreferences.History",
          title: "History & Social Studies",
          rateMin: 1,
          rateMax: 5
        },
        {
          type: "rating",
          name: "subjectPreferences.Arts",
          title: "Arts & Music",
          rateMin: 1,
          rateMax: 5
        },
        {
          type: "rating",
          name: "subjectPreferences.Technology",
          title: "Technology & Computer Science",
          rateMin: 1,
          rateMax: 5
        }
      ]
    },
    {
      name: "learningPreferences",
      title: "Learning Preferences",
      elements: [
        {
          type: "dropdown",
          name: "preferences.communicationStyle",
          title: "How would you prefer explanations to be delivered?",
          isRequired: true,
          choices: [
            { value: "Detailed", text: "Detailed and thorough" },
            { value: "Concise", text: "Brief and to-the-point" },
            { value: "StepByStep", text: "Step-by-step instructions" },
            { value: "BigPicture", text: "Big picture with context" }
          ]
        },
        {
          type: "dropdown",
          name: "preferences.exampleTypes",
          title: "What types of examples help you understand best?",
          isRequired: true,
          choices: [
            { value: "RealWorld", text: "Real-world applications" },
            { value: "Historical", text: "Historical examples" },
            { value: "PopCulture", text: "Pop culture references" },
            { value: "Abstract", text: "Abstract/theoretical examples" }
          ]
        },
        {
          type: "dropdown",
          name: "preferences.feedbackStyle",
          title: "How do you prefer to receive feedback?",
          isRequired: true,
          choices: [
            { value: "Encouraging", text: "Encouraging and positive" },
            { value: "Direct", text: "Direct and straightforward" },
            { value: "Questioning", text: "Through guiding questions" },
            { value: "Detailed", text: "With detailed explanations" }
          ]
        },
        {
          type: "dropdown",
          name: "preferences.pacePreference",
          title: "What learning pace do you prefer?",
          isRequired: true,
          choices: [
            { value: "Faster", text: "Faster pace with challenges" },
            { value: "Moderate", text: "Moderate, balanced pace" },
            { value: "Slower", text: "Slower, thorough pace" },
            { value: "Adaptive", text: "Adaptive (varies by topic)" }
          ]
        }
      ]
    },
    {
      name: "goals",
      title: "Learning Goals",
      elements: [
        {
          type: "comment",
          name: "goals",
          title: "What are your main learning goals right now?",
          placeHolder: "I want to improve..."
        },
        {
          type: "comment",
          name: "specialNeeds",
          title: "Any special learning needs or accommodations we should know about?",
          placeHolder: "Optional information to help tailor your experience"
        }
      ]
    }
  ]
};

const Questionnaire: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initSurvey = async () => {
      try {
        if (!currentUser) {
          navigate("/login");
          return;
        }

        // Create the survey model
        const surveyModel = new Model(surveyJson);
        
        // Try to get any existing questionnaire data
        const existingData = await getQuestionnaireResponses(currentUser.uid);
        
        if (existingData) {
          // Pre-fill the survey with existing data
          surveyModel.data = existingData;
        }
        
        // Handle survey completion
        surveyModel.onComplete.add(async (sender) => {
          try {
            const results = sender.data;
            
            // Process the data before saving
            // Convert any otherInterests to the interests array
            if (results.otherInterests) {
              if (!results.interests) {
                results.interests = [];
              }
              // Split by commas or add as a single item
              const otherItems = results.otherInterests.includes(',') 
                ? results.otherInterests.split(',').map((i: string) => i.trim())
                : [results.otherInterests.trim()];
              
              results.interests = [...results.interests, ...otherItems];
              delete results.otherInterests;
            }
            
            // Ensure subjectPreferences is an object
            if (!results.subjectPreferences) {
              results.subjectPreferences = {};
            }
            
            // Save to Firestore
            await saveQuestionnaireResponses(currentUser.uid, results as Partial<QuestionnaireData>);
            
            // Navigate to dashboard after completion
            setTimeout(() => {
              navigate("/dashboard");
            }, 3000);
          } catch (err) {
            console.error("Error saving questionnaire:", err);
            setError("Failed to save your responses. Please try again.");
          }
        });
        
        setSurvey(surveyModel);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing questionnaire:", err);
        setError("Failed to load the questionnaire. Please refresh the page.");
        setLoading(false);
      }
    };

    initSurvey();
  }, [currentUser, navigate]);

  if (loading) {
    return <div className="questionnaire-loading">Loading questionnaire...</div>;
  }

  if (error) {
    return <div className="questionnaire-error">{error}</div>;
  }

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h1>Personalize Your Learning Experience</h1>
        <p>Your responses help us tailor the AI avatar to your specific needs and preferences</p>
      </div>
      
      <div className="questionnaire-content">
        {survey && <Survey model={survey} />}
      </div>
    </div>
  );
};

export default Questionnaire; 