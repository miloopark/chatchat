import { Router } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { verifyAuth } from '../middleware/authMiddleware';
import { 
  getOrCreateConversation, 
  storeMessage, 
  getConversationHistory,
  getUserConversations,
  deleteConversation 
} from '../services/conversationService';
import { logger } from '../utils/logger';

const router = Router();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.ENV') });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'OpenAI-Beta': 'project_settings=true'
  }
});

// Generate text route with Firestore conversation history
router.post('/generate-text', verifyAuth, async (req, res) => {
  try {
    const { prompt, conversationId: existingConversationId, subject = 'General' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Ensure we have a user ID (from auth middleware)
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get or create a conversation ID if not provided
    let conversationId = existingConversationId;
    if (!conversationId) {
      conversationId = await getOrCreateConversation(userId, subject);
      logger.info(`Created new conversation ${conversationId} for user ${userId}`);
    }
    
    logger.info(`Processing prompt for conversation ${conversationId}: "${prompt.substring(0, 30)}..."`);
    
    // Store the user's message
    await storeMessage(conversationId, 'user', prompt);
    
    // Get conversation history for context
    const history = await getConversationHistory(conversationId);
    
    // Convert history to OpenAI message format, but limit to recent messages to stay within token limits
    // We use the last 15 messages to provide sufficient context
    const messageHistory = history.slice(-15).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant' as 'user' | 'assistant',
      content: msg.content
    }));
    
    // Add system message at the beginning to guide the AI's behavior
    const messages = [
      { 
        role: 'system' as 'system', 
        content: 'You are a helpful assistant with a great memory. Provide personalized responses based on the conversation history.'
      },
      ...messageHistory
    ];
    
    // If the latest message is from the user (should always be true), don't include it again
    if (messages[messages.length - 1]?.role !== 'user') {
      messages.push({ role: 'user' as 'user', content: prompt });
    }
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500
    });
    
    const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // Store the assistant's response in Firestore
    await storeMessage(conversationId, 'assistant', responseText);
    
    logger.info(`Generated response for conversation ${conversationId} (first 30 chars): ${responseText.substring(0, 30)}...`);
    
    return res.status(200).json({ 
      text: responseText,
      conversationId: conversationId
    });
  } catch (error: any) {
    logger.error(`Error generating text completion: ${error.message}`);
    return res.status(500).json({ 
      error: 'Failed to generate text', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get conversation history route
router.get('/conversation/:id', verifyAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get the conversation to verify ownership
    const history = await getConversationHistory(conversationId);
    
    return res.status(200).json({
      conversationId,
      messages: history
    });
  } catch (error: any) {
    logger.error(`Error fetching conversation history: ${error.message}`);
    return res.status(500).json({
      error: 'Failed to fetch conversation history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new conversation route
router.post('/conversation', verifyAuth, async (req, res) => {
  try {
    const { subject = 'General' } = req.body;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const conversationId = await getOrCreateConversation(userId, subject);
    
    return res.status(200).json({ conversationId, subject });
  } catch (error: any) {
    logger.error(`Error creating conversation: ${error.message}`);
    return res.status(500).json({
      error: 'Failed to create conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all conversations for a user
router.get('/conversations', verifyAuth, async (req, res) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const conversations = await getUserConversations(userId);
    
    return res.status(200).json({ conversations });
  } catch (error: any) {
    logger.error(`Error fetching user conversations: ${error.message}`);
    return res.status(500).json({
      error: 'Failed to fetch conversations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a conversation route
router.delete('/conversation/:id', verifyAuth, async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    await deleteConversation(conversationId, userId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Conversation deleted successfully'
    });
  } catch (error: any) {
    logger.error(`Error deleting conversation: ${error.message}`);
    return res.status(500).json({
      error: 'Failed to delete conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
