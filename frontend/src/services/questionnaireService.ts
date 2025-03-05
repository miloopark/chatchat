// This service will handle storing and retrieving questionnaire responses in Firestore

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { COLLECTIONS } from './CONSTANTS';
import { serverTimestamp } from 'firebase/firestore';

// Define comprehensive questionnaire data structure
export interface QuestionnaireData {
  // Basic user info
  name: string;
  age?: number;
  academicLevel: string; // e.g., "Elementary", "Middle School", "High School", "College"
  
  // Learning preferences
  learningStyle: string; // "Visual", "Auditory", "Reading/Writing", "Kinesthetic"
  interests: string[];
  challenges: string[];
  
  // Subject preferences (1-5 scale)
  subjectPreferences: {
    [key: string]: number; // e.g., "math": 4, "science": 5
  };
  
  // Communication preferences
  preferences: {
    communicationStyle: string; // e.g., "Detailed", "Concise", "Step-by-step", "Big picture"
    exampleTypes: string; // e.g., "Real-world", "Abstract", "Historical", "Pop culture"
    feedbackStyle: string; // e.g., "Encouraging", "Direct", "Questioning"
    pacePreference: string; // e.g., "Faster", "Moderate", "Slower"
  };
  
  // Additional context
  specialNeeds?: string;
  goals?: string[];
  lastUpdated: Date;
}

// Default values for new users
const defaultQuestionnaireData: Partial<QuestionnaireData> = {
  learningStyle: "Visual",
  interests: ["General knowledge"],
  challenges: [],
  subjectPreferences: {
    "Math": 3,
    "Science": 3,
    "Reading": 3,
    "History": 3
  },
  preferences: {
    communicationStyle: "Balanced",
    exampleTypes: "Real-world",
    feedbackStyle: "Encouraging",
    pacePreference: "Moderate"
  }
};

/**
 * Save questionnaire responses to Firestore
 */
export const saveQuestionnaireResponses = async (
  userId: string,
  data: Partial<QuestionnaireData>
): Promise<void> => {
  try {
    // Merge with defaults for any missing fields
    const completeData: QuestionnaireData = {
      ...defaultQuestionnaireData,
      ...data,
      lastUpdated: new Date()
    } as QuestionnaireData;
    
    // Save to Firestore under the user's ID
    const docRef = doc(db, "questionnaires", userId);
    await setDoc(docRef, completeData, { merge: true });
    
    console.log("Questionnaire data saved successfully for user:", userId);
  } catch (error) {
    console.error("Error saving questionnaire data:", error);
    throw error;
  }
};

/**
 * Retrieve a user's questionnaire responses
 */
export const getQuestionnaireResponses = async (
  userId: string
): Promise<QuestionnaireData | null> => {
  try {
    const docRef = doc(db, "questionnaires", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as QuestionnaireData;
    } else {
      console.log("No questionnaire data found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving questionnaire data:", error);
    throw error;
  }
};

/**
 * Update just one section of the questionnaire
 */
export const updateQuestionnaireSection = async (
  userId: string,
  section: string,
  data: any
): Promise<void> => {
  try {
    const docRef = doc(db, "questionnaires", userId);
    const updateData = {
      [section]: data,
      lastUpdated: new Date()
    };
    
    await setDoc(docRef, updateData, { merge: true });
    console.log(`Updated ${section} for user:`, userId);
  } catch (error) {
    console.error(`Error updating ${section}:`, error);
    throw error;
  }
};

/**
 * Check if user has completed the questionnaire
 */
export const hasCompletedQuestionnaire = async (
  userId: string
): Promise<boolean> => {
  try {
    const data = await getQuestionnaireResponses(userId);
    // Consider questionnaire completed if we have basic data
    return data !== null && 
           !!data.name && 
           !!data.academicLevel && 
           !!data.learningStyle;
  } catch (error) {
    console.error("Error checking questionnaire completion:", error);
    return false;
  }
}; 