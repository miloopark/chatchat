// Simple Express server with Firebase Firestore integration
// Run with: node direct-start.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.ENV') });

// Get port
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK with Firestore
let db = null;
try {
  const serviceAccount = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  
  // Only initialize if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    });
    
    db = admin.firestore();
    console.log(`Firebase Admin SDK initialized with project: ${serviceAccount.projectId}`);
    console.log('Firestore database initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  // Continue without Firebase if initialization fails
  console.warn('⚠️ Running without Firebase. Conversations will be stored in memory only.');
}

// Create express app
const app = express();

// Check OpenAI API Key
const apiKey = process.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ ERROR: VITE_OPENAI_API_KEY not found in .ENV file');
  process.exit(1);
}

console.log(`Using OpenAI API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

// Initialize OpenAI client - UPDATED for project API key support
let openai;
try {
  // Check if using a project-scoped API key (starts with 'sk-proj-')
  const isProjectKey = apiKey.startsWith('sk-proj-');
  
  if (isProjectKey) {
    console.log('Using project-scoped API key configuration');
    openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.openai.com/v1',
      defaultHeaders: {
        'OpenAI-Beta': 'project_settings=true'
      }
    });
  } else {
    console.log('Using standard API key configuration');
    openai = new OpenAI({
      apiKey: apiKey
    });
  }
  
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  process.exit(1);
}

// Firestore collections
const getConversationsCollection = () => db ? db.collection('conversations') : null;
const getMessagesCollection = () => db ? db.collection('messages') : null;

// In-memory fallback for conversations (used if Firestore initialization fails)
// Use a Map where keys are userIds and values are objects containing that user's conversations
const memoryUsers = new Map();

// Helper function to get/create a user's memory storage
function getUserMemoryStorage(userId) {
  if (!memoryUsers.has(userId)) {
    memoryUsers.set(userId, {
      conversations: {},
      messages: []
    });
  }
  return memoryUsers.get(userId);
}

// Conversation service functions
async function getOrCreateConversation(userId, subject = 'General') {
  try {
    if (db) {
      // Using Firestore
      const conversationsCollection = getConversationsCollection();
      
      // Check if a conversation with this user and subject already exists
      const existingConversationsSnapshot = await conversationsCollection
        .where('userId', '==', userId)
        .where('subject', '==', subject)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      // If a conversation exists, return its ID
      if (!existingConversationsSnapshot.empty) {
        const docId = existingConversationsSnapshot.docs[0].id;
        console.log(`Found existing conversation: ${docId} for user: ${userId}, subject: ${subject}`);
        return docId;
      }

      // Otherwise, create a new conversation
      const conversationId = uuidv4();
      await conversationsCollection.doc(conversationId).set({
        userId,
        subject,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        messageCount: 0
      });

      console.log(`Created new conversation: ${conversationId} for user: ${userId}, subject: ${subject}`);
      return conversationId;
    } else {
      // Memory fallback - user specific
      const userStorage = getUserMemoryStorage(userId);
      const userConversations = userStorage.conversations;
      
      // Check if a conversation exists for this user and subject
      const existingConversation = Object.entries(userConversations)
        .find(([_, conv]) => conv.subject === subject);
      
      if (existingConversation) {
        const convoId = existingConversation[0];
        console.log(`Found existing memory conversation: ${convoId} for user ${userId}`);
        return convoId;
      }
      
      // Create a new conversation
      const conversationId = uuidv4();
      userConversations[conversationId] = {
        userId,
        subject,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      };
      
      console.log(`Created new memory conversation: ${conversationId} for user: ${userId}, subject: ${subject}`);
      return conversationId;
    }
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    
    // Even if there's an error, create a memory-based conversation as fallback
    const userStorage = getUserMemoryStorage(userId);
    const conversationId = uuidv4();
    userStorage.conversations[conversationId] = {
      userId,
      subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0
    };
    
    console.log(`Created fallback memory conversation: ${conversationId} after error for user ${userId}`);
    return conversationId;
  }
}

async function storeMessage(conversationId, sender, content, userId = null) {
  try {
    if (db) {
      // Using Firestore
      // Check if the conversation exists
      const conversationsCollection = getConversationsCollection();
      const messagesCollection = getMessagesCollection();
      
      let conversationDoc = await conversationsCollection.doc(conversationId).get();
      
      // Check if the conversation exists and has valid data
      if (!conversationDoc.exists || !conversationDoc.data() || !conversationDoc.data().userId) {
        console.log(`Conversation ${conversationId} not found or has invalid data, attempting to create a new one`);
        
        // We'll need a userId to create a new conversation
        if (!userId) {
          // If no userId was provided, we can't create a new conversation
          throw new Error(`Cannot create a new conversation without a userId`);
        }
        
        // Create a new conversation instead
        const newConversationId = await getOrCreateConversation(userId, 'General');
        console.log(`Created new conversation ${newConversationId} to replace missing or invalid conversation ${conversationId}`);
        
        // Use the new conversation ID
        conversationId = newConversationId;
        conversationDoc = await conversationsCollection.doc(conversationId).get();
        
        // Double-check that the new conversation is valid
        if (!conversationDoc.exists || !conversationDoc.data() || !conversationDoc.data().userId) {
          throw new Error(`Failed to create a valid new conversation`);
        }
      }

      // Safely get the userId from the conversation
      let conversationUserId;
      try {
        conversationUserId = conversationDoc.data().userId;
        if (!conversationUserId) {
          throw new Error('Conversation document missing userId field');
        }
      } catch (err) {
        // Handle missing data
        console.error(`Error getting userId from conversation ${conversationId}:`, err);
        
        // If we have a userId parameter, use it to repair the conversation
        if (userId) {
          console.log(`Repairing conversation ${conversationId} with userId ${userId}`);
          await conversationsCollection.doc(conversationId).update({
            userId: userId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          conversationUserId = userId;
        } else {
          throw new Error(`Cannot determine userId for conversation ${conversationId}. Missing both in document and parameters.`);
        }
      }

      // Create a message document
      const messageId = uuidv4();
      await messagesCollection.doc(messageId).set({
        conversationId,
        userId: conversationUserId, // Use the userId from the conversation
        sender,
        content,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update the conversation
      await conversationsCollection.doc(conversationId).update({
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        messageCount: admin.firestore.FieldValue.increment(1),
        lastMessagePreview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
      });

      console.log(`Stored message from ${sender} in conversation: ${conversationId} for user: ${conversationUserId}`);
      return { messageId, conversationId }; // Return both the message ID and (possibly new) conversation ID
    } else {
      // Memory fallback - need to find which user owns this conversation
      let foundUserId = userId; // Use the provided userId if available
      let foundUserStorage = null;
      
      // Search across all users for this conversation ID
      for (const [uid, userStorage] of memoryUsers.entries()) {
        if (conversationId in userStorage.conversations) {
          foundUserId = uid;
          foundUserStorage = userStorage;
          break;
        }
      }
      
      // If we didn't find the conversation but have a userId, create a new one
      if (!foundUserStorage && foundUserId) {
        foundUserStorage = getUserMemoryStorage(foundUserId);
        // Create a new conversation
        const newConversationId = uuidv4();
        foundUserStorage.conversations[newConversationId] = {
          userId: foundUserId,
          subject: 'General',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0
        };
        
        console.log(`Created new memory conversation: ${newConversationId} to replace missing conversation ${conversationId}`);
        conversationId = newConversationId;
      } else if (!foundUserStorage) {
        console.log(`Memory conversation ${conversationId} not found and no userId provided to create a new one`);
        throw new Error('Conversation not found and no userId provided to create a new one');
      }
      
      // Create a message
      const messageId = uuidv4();
      const message = {
        id: messageId,
        conversationId,
        userId: foundUserId, // Add userId to message
        sender,
        content,
        timestamp: new Date().toISOString()
      };
      
      // Store the message in the user's message array
      foundUserStorage.messages.push(message);
      
      // Update the conversation
      foundUserStorage.conversations[conversationId].updatedAt = new Date().toISOString();
      foundUserStorage.conversations[conversationId].messageCount += 1;
      foundUserStorage.conversations[conversationId].lastMessagePreview = 
        content.substring(0, 50) + (content.length > 50 ? '...' : '');
      
      console.log(`Stored memory message from ${sender} in conversation: ${conversationId} for user: ${foundUserId}`);
      return { messageId, conversationId }; // Return both IDs
    }
  } catch (error) {
    console.error('Error in storeMessage:', error);
    throw error; // Let the caller handle the error
  }
}

async function getConversationHistory(conversationId) {
  try {
    if (db) {
      // Using Firestore
      // Check if the conversation exists
      const conversationsCollection = getConversationsCollection();
      const messagesCollection = getMessagesCollection();
      
      let conversationDoc = await conversationsCollection.doc(conversationId).get();
      if (!conversationDoc.exists) {
        console.log(`Conversation ${conversationId} not found for history`);
        throw new Error('Conversation not found');
      }

      // Get the userId from the conversation for security check
      let conversationUserId;
      try {
        conversationUserId = conversationDoc.data().userId;
        if (!conversationUserId) {
          console.warn(`Conversation ${conversationId} exists but has no userId field`);
          throw new Error('Conversation data invalid - missing userId');
        }
      } catch (error) {
        console.error(`Error accessing conversationDoc data for ${conversationId}:`, error);
        throw new Error(`Cannot access conversation data: ${error.message}`);
      }

      try {
        // Get all messages for this conversation, ordered by timestamp
        const messagesSnapshot = await messagesCollection
          .where('conversationId', '==', conversationId)
          .orderBy('timestamp')
          .get();

        // Map the messages to a more convenient format
        const messages = messagesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            sender: data.sender,
            content: data.content,
            timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null
          };
        });

        return messages;
      } catch (error) {
        // Handle the Firestore indexing error
        if (error.code === 9 && error.details && error.details.includes('index')) {
          console.warn(`Firestore index error: ${error.details}`);
          console.warn('Consider creating the index using the URL above');
          
          // First try a simpler query without the order by
          try {
            const messagesSnapshot = await messagesCollection
              .where('conversationId', '==', conversationId)
              .get();
              
            // Map and manually sort the messages
            const messages = messagesSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                sender: data.sender,
                content: data.content,
                timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null
              };
            }).sort((a, b) => {
              return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
            });
            
            return messages;
          } catch (innerError) {
            console.error("Error with fallback query:", innerError);
            
            // Last resort: check if the conversation exists in memory
            // Search across all users to find it
            for (const [userId, userStorage] of memoryUsers.entries()) {
              if (conversationId in userStorage.conversations) {
                console.log(`Found conversation ${conversationId} in memory storage for user ${userId}`);
                
                // Get all messages for this conversation, ordered by timestamp
                const memoryMessages = userStorage.messages
                  .filter(msg => msg.conversationId === conversationId)
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                  
                return memoryMessages;
              }
            }
            
            // If we still can't find it, return an empty array as a last resort
            console.warn(`No messages found for conversation ${conversationId} in any storage`);
            return [];
          }
        }
        // Re-throw other errors
        throw error;
      }
    } else {
      // Memory fallback - need to find which user owns this conversation
      let foundUserStorage = null;
      
      // Search across all users for this conversation ID
      for (const [userId, userStorage] of memoryUsers.entries()) {
        if (conversationId in userStorage.conversations) {
          foundUserStorage = userStorage;
          break;
        }
      }
      
      if (!foundUserStorage) {
        console.log(`Memory conversation ${conversationId} not found for history`);
        throw new Error('Conversation not found');
      }
      
      // Get all messages for this conversation, ordered by timestamp
      return foundUserStorage.messages
        .filter(msg => msg.conversationId === conversationId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    throw error; // Let the caller handle the error
  }
}

async function getUserConversations(userId) {
  try {
    if (db) {
      // Using Firestore
      const conversationsCollection = getConversationsCollection();
      
      // Get all conversations for this user, ordered by lastUpdated
      const conversationsSnapshot = await conversationsCollection
        .where('userId', '==', userId)
        .orderBy('lastUpdated', 'desc')
        .get();

      // Map the conversations to a more convenient format
      const conversations = conversationsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          subject: data.subject,
          lastMessagePreview: data.lastMessagePreview || '',
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
          updatedAt: data.lastUpdated ? data.lastUpdated.toDate().toISOString() : null,
          messageCount: data.messageCount || 0
        };
      });

      return conversations;
    } else {
      // Memory fallback - only return conversations for this user
      const userStorage = getUserMemoryStorage(userId);
      
      // Get all conversations for this user, ordered by updatedAt
      const userConversations = Object.entries(userStorage.conversations)
        .map(([id, conv]) => ({
          id,
          subject: conv.subject,
          lastMessagePreview: conv.lastMessagePreview || '',
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messageCount || 0
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      return userConversations;
    }
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    throw error; // Let the caller handle the error
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Authentication middleware
app.use(async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 10) {
      const token = authHeader.split('Bearer ')[1];
      
      // Only log first 10 chars for security
      console.log(`Received auth token: ${token.substring(0, 10)}...`);
      
      // Verify the Firebase ID token if possible
      try {
        // If Firebase Admin is initialized, verify the token
        if (admin.apps.length) {
          const decodedToken = await admin.auth().verifyIdToken(token);
          
          if (!decodedToken || !decodedToken.uid) {
            throw new Error('Invalid Firebase token: missing uid');
          }
          
          req.user = { 
            uid: decodedToken.uid,
            email: decodedToken.email || null,
            displayName: decodedToken.name || null
          };
          console.log(`Authenticated user: ${req.user.uid} (${req.user.email || 'no email'})`);
        } else {
          // If Firebase Admin isn't available, extract user info from token
          // This is just for development - in production, always verify tokens
          // Simple JWT structure - assume token has three parts split by dots
          const tokenParts = token.split('.');
          
          if (tokenParts.length === 3) {
            // The second part (index 1) contains the payload
            const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
            
            // Extract user info from the payload - common JWT fields
            const uid = payload.user_id || payload.sub || payload.uid;
            
            if (!uid) {
              throw new Error('Invalid JWT token: missing user identifier');
            }
            
            req.user = {
              uid: uid,
              email: payload.email || null,
              displayName: payload.name || null
            };
            console.log(`Using JWT payload for user: ${req.user.uid} (${req.user.email || 'no email'})`);
          } else {
            // Fallback to anonymous user with random ID if token format is invalid
            req.user = { uid: `anon-${uuidv4().substring(0, 8)}` };
            console.log(`Invalid token format. Using anonymous user: ${req.user.uid}`);
          }
        }
      } catch (error) {
        // If token verification fails, use a unique anonymous ID
        console.warn(`Token verification failed: ${error.message}`);
        req.user = { uid: `anon-${uuidv4().substring(0, 8)}` };
        console.log(`Fallback to anonymous user: ${req.user.uid}`);
      }
    } else {
      // No valid token, create an anonymous user with a random ID
      // Using random IDs for anonymous users ensures data isolation
      req.user = { uid: `anon-${uuidv4().substring(0, 8)}` };
      console.log(`No auth token. Using anonymous user: ${req.user.uid}`);
    }
    
    // Final safety check to ensure we always have a user ID
    if (!req.user || !req.user.uid) {
      req.user = { uid: `anon-${uuidv4().substring(0, 8)}` };
      console.log(`Safety fallback to anonymous user: ${req.user.uid}`);
    }
    
    // Proceed to next middleware
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Still allow the request to proceed with an anonymous user
    req.user = { uid: `anon-${uuidv4().substring(0, 8)}` };
    console.log(`Error fallback to anonymous user: ${req.user.uid}`);
    next();
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    storageType: db ? 'firestore' : 'memory',
    userId: req.user.uid,
    userEmail: req.user.email || 'not available',
    userCount: memoryUsers.size
  });
});

// New function to fetch questionnaire data for a user
async function getUserQuestionnaireData(userId) {
  try {
    if (!db) {
      console.log('Firestore not available, cannot fetch questionnaire data');
      return null;
    }
    
    // Get the questionnaire document for this user
    const questionnaireRef = db.collection('questionnaires').doc(userId);
    const questionnaireDoc = await questionnaireRef.get();
    
    if (!questionnaireDoc.exists) {
      console.log(`No questionnaire data found for user ${userId}`);
      
      // As a fallback, try looking in a different collection name
      try {
        const altQuestionnaireRef = db.collection('QUESTIONNAIRES').doc(userId);
        const altQuestionnaireDoc = await altQuestionnaireRef.get();
        
        if (altQuestionnaireDoc.exists) {
          console.log(`Found questionnaire data in alternative collection for user ${userId}`);
          return altQuestionnaireDoc.data();
        }
      } catch (err) {
        console.log("Failed to check alternative collection", err);
      }
      
      return null;
    }
    
    console.log(`Found questionnaire data for user ${userId} with fields:`, Object.keys(questionnaireDoc.data()));
    return questionnaireDoc.data();
  } catch (error) {
    console.error('Error fetching questionnaire data:', error);
    return null;
  }
}

// Helper function to build a personalized system prompt
function buildPersonalizedSystemPrompt(questionnaireData) {
  // Default prompt if no questionnaire data is available
  if (!questionnaireData) {
    return 'You are a helpful assistant with a great memory. Provide informative, personalized responses based on the conversation history.';
  }
  
  // Extract key information from questionnaire data
  const learningStyle = questionnaireData.learningStyle || '';
  const interests = questionnaireData.interests || [];
  const challenges = questionnaireData.challenges || [];
  const preferences = questionnaireData.preferences || {};
  const academicLevel = questionnaireData.academicLevel || '';
  const subjectPreferences = questionnaireData.subjectPreferences || {};
  const name = questionnaireData.name || '';
  
  // Build a detailed system prompt incorporating user data
  let systemPrompt = `IMPORTANT: You are a personalized educational assistant for ${name || 'the user'}. You MUST incorporate the following user information in your responses:\n\n`;
  
  // Add learning style if available
  if (learningStyle) {
    systemPrompt += `1. LEARNING STYLE: ${learningStyle}. You must adapt your explanations to this style.\n`;
  }
  
  // Add academic level if available
  if (academicLevel) {
    systemPrompt += `2. ACADEMIC LEVEL: ${academicLevel}. Tailor your language and concepts to this level.\n`;
  }
  
  // Add interests
  if (interests && interests.length > 0) {
    systemPrompt += `3. INTERESTS: ${interests.join(', ')}. Reference these topics when possible to make explanations more engaging.\n`;
  }
  
  // Add learning challenges
  if (challenges && challenges.length > 0) {
    systemPrompt += `4. LEARNING CHALLENGES: ${challenges.join(', ')}. Provide extra support in these areas.\n`;
  }
  
  // Add subject preferences if available
  if (subjectPreferences && Object.keys(subjectPreferences).length > 0) {
    const favoriteSubjects = Object.entries(subjectPreferences)
      .filter(([_, rating]) => rating >= 4)
      .map(([subject, _]) => subject);
    
    if (favoriteSubjects.length > 0) {
      systemPrompt += `5. FAVORITE SUBJECTS: ${favoriteSubjects.join(', ')}. Use examples from these subjects when possible.\n`;
    }
    
    const challengingSubjects = Object.entries(subjectPreferences)
      .filter(([_, rating]) => rating <= 2)
      .map(([subject, _]) => subject);
    
    if (challengingSubjects.length > 0) {
      systemPrompt += `6. CHALLENGING SUBJECTS: ${challengingSubjects.join(', ')}. Provide additional scaffolding when discussing these.\n`;
    }
  }
  
  // Add communication preferences
  if (preferences) {
    systemPrompt += "7. COMMUNICATION PREFERENCES:\n";
    
    if (preferences.communicationStyle) {
      systemPrompt += `   - Style: ${preferences.communicationStyle}.\n`;
    }
    
    if (preferences.exampleTypes) {
      systemPrompt += `   - Examples: ${preferences.exampleTypes}.\n`;
    }
    
    if (preferences.feedbackStyle) {
      systemPrompt += `   - Feedback: ${preferences.feedbackStyle}.\n`;
    }
  }
  
  // Add instructions about replying to direct questions about preferences
  systemPrompt += `\nVERY IMPORTANT: When the user asks about their learning preferences or profile, you MUST respond with specific details from the information above. For example, if they ask "What do you know about my learning preferences?", tell them you know their learning style is ${learningStyle || "not specified"}, they're interested in ${interests.length > 0 ? interests.join(", ") : "topics they haven't shared yet"}, etc.

Guidelines for your interactions:
1. ALWAYS tailor explanations to their ${learningStyle || "preferred"} learning style and ${academicLevel || "appropriate"} academic level
2. Connect new concepts to their interests when possible
3. Provide extra support in challenging areas
4. Be encouraging and supportive
5. Remember details about previous conversations to build continuity
6. Adapt your tone and complexity based on the user's responses
7. Use relatable examples that connect to their interests and experiences
`;
  
  return systemPrompt;
}

// Text generation API with conversation memory
app.post('/api/generate-text', async (req, res) => {
  try {
    const { prompt, conversationId: existingConversationId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Get the user ID from the auth middleware
    const userId = req.user.uid;
    if (!userId) {
      return res.status(401).json({ 
        error: 'User authentication is required',
        details: 'No user ID was found in the request. Make sure you are logged in.'
      });
    }
    
    console.log(`Processing request for user: ${userId} with prompt: "${prompt.substring(0, 30)}..."`);
    
    // Fetch the user's questionnaire data for personalization
    const questionnaireData = await getUserQuestionnaireData(userId);
    
    if (questionnaireData) {
      console.log(`Retrieved questionnaire data for user ${userId}:`, {
        name: questionnaireData.name || 'Not provided',
        learningStyle: questionnaireData.learningStyle || 'Not provided',
        academicLevel: questionnaireData.academicLevel || 'Not provided',
        hasInterests: questionnaireData.interests ? questionnaireData.interests.length > 0 : false,
        hasChallenges: questionnaireData.challenges ? questionnaireData.challenges.length > 0 : false
      });
    } else {
      console.log(`No questionnaire data found for user ${userId} - using default system prompt`);
    }
    
    // Get or create a conversation ID if not provided
    let convoId = existingConversationId;
    let useMemoryFallback = false;
    
    if (!convoId) {
      try {
        convoId = await getOrCreateConversation(userId, 'General');
      } catch (error) {
        // Check if this is a Firestore index error
        if (error.code === 9 && error.details && error.details.includes('index')) {
          console.warn('Firestore index missing - using memory fallback');
          useMemoryFallback = true;
          
          // Check if we already have a memory conversation for this user
          let foundConversation = null;
          const userStorage = getUserMemoryStorage(userId);
          
          if (Object.keys(userStorage.conversations).length > 0) {
            // Use the first conversation we find
            const firstConvoId = Object.keys(userStorage.conversations)[0];
            foundConversation = userStorage.conversations[firstConvoId];
            convoId = firstConvoId;
            console.log(`Using existing memory conversation: ${convoId}`);
          } else {
            // Create a new memory conversation
            convoId = uuidv4();
            userStorage.conversations[convoId] = {
              userId,
              subject: 'General',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messageCount: 0
            };
            console.log(`Created new memory conversation: ${convoId}`);
          }
        } else {
          // For other errors, rethrow
          throw error;
        }
      }
    }
    
    console.log(`Processing prompt for conversation ${convoId}: "${prompt.substring(0, 30)}..."`);
    
    try {
      // Store the user's message, passing userId in case a new conversation needs to be created
      let messageResult;
      
      if (useMemoryFallback) {
        // Store directly in memory
        const userStorage = getUserMemoryStorage(userId);
        
        // Check if this conversation exists
        if (!(convoId in userStorage.conversations)) {
          // Create a new memory conversation
          convoId = uuidv4();
          userStorage.conversations[convoId] = {
            userId,
            subject: 'General',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 0
          };
          console.log(`Created new memory conversation: ${convoId}`);
        }
        
        // Store the message
        const messageId = uuidv4();
        const message = {
          id: messageId,
          conversationId: convoId,
          userId,
          sender: 'user',
          content: prompt,
          timestamp: new Date().toISOString()
        };
        
        userStorage.messages.push(message);
        
        // Update the conversation
        userStorage.conversations[convoId].updatedAt = new Date().toISOString();
        userStorage.conversations[convoId].messageCount += 1;
        userStorage.conversations[convoId].lastMessagePreview = 
          prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '');
        
        messageResult = { messageId, conversationId: convoId };
      } else {
        // Use regular storage method
        messageResult = await storeMessage(convoId, 'user', prompt, userId);
      }
      
      // Update the conversation ID if a new one was created
      if (messageResult.conversationId !== convoId) {
        convoId = messageResult.conversationId;
        console.log(`Using new conversation ID: ${convoId}`);
      }
      
      // Get conversation history for context
      let history;
      
      if (useMemoryFallback) {
        // Get from memory
        const userStorage = getUserMemoryStorage(userId);
        history = userStorage.messages
          .filter(msg => msg.conversationId === convoId)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      } else {
        // Try to get from regular storage
        try {
          history = await getConversationHistory(convoId);
        } catch (error) {
          // If error getting history, use an empty array
          console.warn(`Error getting conversation history: ${error.message}. Using empty history.`);
          history = [];
        }
      }
      
      // Convert history to OpenAI message format, but limit to recent messages
      const messageHistory = history.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Build a personalized system prompt using questionnaire data
      const systemPrompt = buildPersonalizedSystemPrompt(questionnaireData);
      
      // Add system message at the beginning
      const messages = [
        { role: 'system', content: systemPrompt },
        ...messageHistory
      ];
      
      // If the latest message is from the user (should always be true), don't include it again
      if (messages[messages.length - 1]?.role !== 'user') {
        messages.push({ role: 'user', content: prompt });
      }
      
      console.log("Using personalized system prompt:", systemPrompt);
      console.log("Sending total of", messages.length, "messages to OpenAI");
      
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500
        });
        
        const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        // Store the assistant's response
        if (useMemoryFallback) {
          // Store in memory
          const userStorage = getUserMemoryStorage(userId);
          const messageId = uuidv4();
          const message = {
            id: messageId,
            conversationId: convoId,
            userId,
            sender: 'assistant',
            content: responseText,
            timestamp: new Date().toISOString()
          };
          
          userStorage.messages.push(message);
          
          // Update the conversation
          userStorage.conversations[convoId].updatedAt = new Date().toISOString();
          userStorage.conversations[convoId].messageCount += 1;
          userStorage.conversations[convoId].lastMessagePreview = 
            responseText.substring(0, 50) + (responseText.length > 50 ? '...' : '');
        } else {
          // Use regular storage
          try {
            await storeMessage(convoId, 'assistant', responseText, userId);
          } catch (error) {
            console.warn(`Error storing assistant response: ${error.message}. Continuing anyway.`);
            // Don't fail the request if storing the response fails
          }
        }
        
        console.log(`Generated response for conversation ${convoId} (first 30 chars): ${responseText.substring(0, 30)}...`);
        
        return res.status(200).json({ 
          text: responseText,
          conversationId: convoId,
          storageType: useMemoryFallback ? 'memory' : 'firestore'
        });
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Return a more helpful error message to the client
        return res.status(500).json({ 
          error: 'Failed to generate text', 
          details: `OpenAI API error: ${openaiError.message}`,
          openaiError: openaiError.toString()
        });
      }
    } catch (error) {
      // Handle the specific case of conversation not found or userId missing
      if (error.message.includes('not found') || error.message.includes('userId')) {
        console.log(`Error with conversation ${convoId}: ${error.message}. Creating a new one.`);
        
        try {
          // Try to get a fresh conversation ID
          const newConvoId = await getOrCreateConversation(userId, 'General');
          console.log(`Created new conversation ${newConvoId}`);
          
          // Store the user's message in the new conversation
          await storeMessage(newConvoId, 'user', prompt, userId);
          
          // Generate a response without history
          const messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ];
          
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500
          });
          
          const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
          
          // Store the assistant's response
          await storeMessage(newConvoId, 'assistant', responseText, userId);
          
          console.log(`Generated fresh response for new conversation: ${responseText.substring(0, 30)}...`);
          
          return res.status(200).json({ 
            text: responseText,
            conversationId: newConvoId,
            note: 'Created a new conversation because the previous one had issues'
          });
        } catch (recoveryError) {
          console.error('Failed to recover conversation:', recoveryError);
          return res.status(500).json({
            error: 'Failed to generate text',
            details: `Failed to create a new conversation: ${recoveryError.message}`
          });
        }
      } else {
        // For other errors, re-throw to the outer catch block
        throw error;
      }
    }
  } catch (error) {
    console.error('Error generating text completion:', error.message);
    return res.status(500).json({ 
      error: 'Failed to generate text', 
      details: error.message 
    });
  }
});

// Create or retrieve a conversation
app.post('/api/conversation', async (req, res) => {
  try {
    const { subject = 'General' } = req.body;
    const userId = req.user.uid;
    
    const conversationId = await getOrCreateConversation(userId, subject);
    
    res.status(200).json({ conversationId, subject });
  } catch (error) {
    console.error('Error creating/retrieving conversation:', error.message);
    return res.status(500).json({
      error: 'Failed to create/retrieve conversation',
      details: error.message
    });
  }
});

// Get conversation history
app.get('/api/conversation/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.uid;
    
    try {
      // Get the conversation to verify ownership if using Firestore
      let conversationBelongsToUser = false;
      
      if (db) {
        const conversationsCollection = getConversationsCollection();
        const conversationDoc = await conversationsCollection.doc(conversationId).get();
        
        if (!conversationDoc.exists) {
          return res.status(404).json({ 
            error: 'Conversation not found',
            details: 'The requested conversation does not exist'
          });
        }
        
        // Check if the conversation belongs to the current user
        conversationBelongsToUser = conversationDoc.data().userId === userId;
        
        if (!conversationBelongsToUser) {
          return res.status(403).json({ 
            error: 'Access denied',
            details: 'You do not have permission to access this conversation'
          });
        }
      } else {
        // For memory storage, check if this user has this conversation
        const userStorage = getUserMemoryStorage(userId);
        conversationBelongsToUser = conversationId in userStorage.conversations;
        
        if (!conversationBelongsToUser) {
          return res.status(403).json({ 
            error: 'Access denied',
            details: 'You do not have permission to access this conversation'
          });
        }
      }
      
      // Get the conversation history
      const history = await getConversationHistory(conversationId);
      
      return res.status(200).json({
        conversationId,
        messages: history,
        userId: userId // Include userId for frontend verification
      });
    } catch (error) {
      // If conversation not found or other error
      console.error('Error fetching conversation:', error);
      
      if (error.message.includes('not found') || error.message.includes('Not found')) {
        return res.status(404).json({ 
          error: 'Conversation not found',
          details: error.message
        });
      }
      
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error fetching conversation history:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch conversation history',
      details: error.message
    });
  }
});

// Get all conversations for a user
app.get('/api/conversations', async (req, res) => {
  try {
    const userId = req.user.uid;
    const conversations = await getUserConversations(userId);
    
    return res.status(200).json({ 
      conversations,
      userId // Include userId for frontend verification
    });
  } catch (error) {
    console.error('Error fetching user conversations:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch conversations',
      details: error.message
    });
  }
});

// Clear all session storage (helps reset when there are problems)
app.post('/api/clear-storage', (req, res) => {
  // This endpoint doesn't actually clear server-side storage
  // It's a signal to the frontend to clear its sessionStorage
  return res.status(200).json({
    success: true,
    message: 'Signal to clear storage received'
  });
});

// Delete a conversation
app.delete('/api/conversation/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.uid;
    
    // Verify ownership
    if (db) {
      const conversationsCollection = getConversationsCollection();
      const conversationDoc = await conversationsCollection.doc(conversationId).get();
      
      if (!conversationDoc.exists) {
        return res.status(404).json({ 
          error: 'Conversation not found',
          details: 'The requested conversation does not exist'
        });
      }
      
      // Check if the conversation belongs to the current user
      if (conversationDoc.data().userId !== userId) {
        return res.status(403).json({ 
          error: 'Access denied',
          details: 'You do not have permission to delete this conversation'
        });
      }
      
      // Delete all related messages
      const messagesCollection = getMessagesCollection();
      const messagesSnapshot = await messagesCollection
        .where('conversationId', '==', conversationId)
        .get();
      
      const batch = db.batch();
      messagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Delete the conversation document
      batch.delete(conversationsCollection.doc(conversationId));
      
      // Commit the batch
      await batch.commit();
    } else {
      // For memory storage
      const userStorage = getUserMemoryStorage(userId);
      
      // Check if this conversation exists for this user
      if (!(conversationId in userStorage.conversations)) {
        return res.status(404).json({ 
          error: 'Conversation not found',
          details: 'The requested conversation does not exist or does not belong to you'
        });
      }
      
      // Delete the conversation
      delete userStorage.conversations[conversationId];
      
      // Filter out messages for this conversation
      userStorage.messages = userStorage.messages.filter(
        msg => msg.conversationId !== conversationId
      );
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({
      error: 'Failed to delete conversation',
      details: error.message
    });
  }
});

// Utility endpoint to check and fix a conversation
app.post('/api/conversation/:id/repair', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.uid;
    
    if (!db) {
      return res.status(500).json({
        error: 'Firestore not available',
        details: 'This endpoint only works with Firestore storage'
      });
    }
    
    const conversationsCollection = getConversationsCollection();
    const conversationDoc = await conversationsCollection.doc(conversationId).get();
    
    // Check if the conversation exists
    if (!conversationDoc.exists) {
      return res.status(404).json({
        error: 'Conversation not found',
        details: 'The requested conversation does not exist'
      });
    }
    
    const conversationData = conversationDoc.data();
    
    // Check for data integrity
    const issues = [];
    
    if (!conversationData) {
      issues.push('Conversation document has no data');
    } else {
      if (!conversationData.userId) {
        issues.push('Missing userId field');
      }
      
      if (!conversationData.subject) {
        issues.push('Missing subject field');
      }
      
      if (!conversationData.createdAt) {
        issues.push('Missing createdAt field');
      }
    }
    
    // If no issues found
    if (issues.length === 0) {
      return res.status(200).json({
        status: 'ok',
        message: 'Conversation appears valid',
        conversationId,
        data: {
          userId: conversationData.userId,
          subject: conversationData.subject,
          messageCount: conversationData.messageCount || 0,
          createdAt: conversationData.createdAt ? conversationData.createdAt.toDate().toISOString() : null
        }
      });
    }
    
    // If issues found, try to repair the conversation
    try {
      // Update with corrected fields
      const updates = {
        userId: conversationData?.userId || userId, // Use existing or current user ID
        subject: conversationData?.subject || 'General',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        messageCount: conversationData?.messageCount || 0,
        lastMessagePreview: conversationData?.lastMessagePreview || 'Conversation repaired'
      };
      
      // Add createdAt if missing
      if (!conversationData?.createdAt) {
        updates.createdAt = admin.firestore.FieldValue.serverTimestamp();
      }
      
      // Update the conversation
      await conversationsCollection.doc(conversationId).update(updates);
      
      return res.status(200).json({
        status: 'repaired',
        message: 'Conversation repaired successfully',
        issues,
        conversationId,
        repairs: updates
      });
    } catch (repairError) {
      return res.status(500).json({
        error: 'Failed to repair conversation',
        details: repairError.message,
        issues
      });
    }
  } catch (error) {
    console.error('Error checking conversation:', error);
    return res.status(500).json({
      error: 'Failed to check conversation',
      details: error.message
    });
  }
});

// Endpoint to create a fresh conversation and delete the old one
app.post('/api/conversation/:id/replace', async (req, res) => {
  try {
    const oldConversationId = req.params.id;
    const userId = req.user.uid;
    const { subject = 'General' } = req.body;
    
    // Create a new conversation
    const newConversationId = await getOrCreateConversation(userId, subject);
    
    if (db) {
      try {
        // Try to delete the old conversation if it exists
        const conversationsCollection = getConversationsCollection();
        const messagesCollection = getMessagesCollection();
        
        // Check if the conversation exists
        const conversationDoc = await conversationsCollection.doc(oldConversationId).get();
        
        if (conversationDoc.exists) {
          // Delete all messages for this conversation
          const messagesSnapshot = await messagesCollection
            .where('conversationId', '==', oldConversationId)
            .get();
          
          const batch = db.batch();
          messagesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          // Delete the conversation document
          batch.delete(conversationsCollection.doc(oldConversationId));
          
          // Commit the deletions
          await batch.commit();
        }
      } catch (deleteError) {
        console.warn(`Failed to delete old conversation ${oldConversationId}:`, deleteError.message);
        // Continue anyway - the important part is creating the new conversation
      }
    }
    
    return res.status(200).json({
      status: 'replaced',
      message: 'Created new conversation to replace the old one',
      oldConversationId,
      newConversationId
    });
  } catch (error) {
    console.error('Error replacing conversation:', error);
    return res.status(500).json({
      error: 'Failed to replace conversation',
      details: error.message
    });
  }
});

// Utility endpoint to reset all conversations for the current user
app.post('/api/reset-all-conversations', async (req, res) => {
  try {
    const userId = req.user.uid;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        details: 'No user ID found in the request'
      });
    }
    
    // Delete all conversations for this user
    if (db) {
      try {
        // First get all conversations for this user
        const conversationsCollection = getConversationsCollection();
        const conversationsSnapshot = await conversationsCollection
          .where('userId', '==', userId)
          .get();
          
        if (conversationsSnapshot.empty) {
          return res.status(200).json({
            message: 'No conversations found to delete',
            count: 0
          });
        }
        
        // Get the IDs of all conversations to delete
        const conversationIds = conversationsSnapshot.docs.map(doc => doc.id);
        
        // Get messages for all these conversations
        const messagesCollection = getMessagesCollection();
        const messagesSnapshot = await messagesCollection
          .where('userId', '==', userId)
          .get();
          
        // Start a batch operation
        const batch = db.batch();
        
        // Add all messages to the batch delete
        messagesSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Add all conversations to the batch delete
        conversationsSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        // Commit the batch
        await batch.commit();
        
        return res.status(200).json({
          message: 'Successfully deleted all conversations and messages',
          conversationsDeleted: conversationIds.length,
          messagesDeleted: messagesSnapshot.docs.length
        });
      } catch (error) {
        // If we hit an error with Firestore, fall back to memory
        console.error('Error deleting conversations from Firestore:', error);
        
        // Continue with memory deletion
      }
    }
    
    // For memory storage, or as a fallback if Firestore fails
    if (memoryUsers.has(userId)) {
      const userStorage = memoryUsers.get(userId);
      const conversationCount = Object.keys(userStorage.conversations).length;
      const messageCount = userStorage.messages.length;
      
      // Reset the user's storage
      userStorage.conversations = {};
      userStorage.messages = [];
      
      return res.status(200).json({
        message: 'Successfully reset all conversations in memory storage',
        conversationsDeleted: conversationCount,
        messagesDeleted: messageCount,
        storageType: db ? 'memory (fallback)' : 'memory'
      });
    } else {
      // No conversations found for this user
      return res.status(200).json({
        message: 'No conversations found in memory for this user',
        count: 0,
        storageType: 'memory'
      });
    }
  } catch (error) {
    console.error('Error resetting conversations:', error);
    return res.status(500).json({
      error: 'Failed to reset conversations',
      details: error.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`
  ====================================
  🚀 Server running on port ${port}!
  ====================================
  
  • Health check: http://localhost:${port}/health
  • API endpoint: http://localhost:${port}/api/generate-text
  
  Using ${db ? 'Firebase Firestore' : 'in-memory storage'} for conversations
  Authentication is now PROPERLY linked to Firebase user IDs
  `);
}); 