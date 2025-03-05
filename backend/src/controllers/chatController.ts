import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import openaiService from '../services/openaiService';
import conversationService from '../services/conversationService';

/**
 * Generate text from OpenAI based on the user's prompt
 */
export async function generateText(req: Request, res: Response) {
  try {
    const { prompt, conversationId } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    logger.info(`Generating text for user ${userId}, conversation ${conversationId}`);

    // Get user questionnaire responses for context
    const userContext = await conversationService.getUserQuestionnaireResponses(userId);
    
    // Get conversation history
    const conversationHistory = await conversationService.getConversationHistory(conversationId);
    
    // Store user message
    await conversationService.storeMessage(conversationId, prompt, 'User', userId);
    
    // Generate response from OpenAI
    const responseText = await openaiService.generateResponse(
      prompt,
      userContext,
      conversationHistory
    );
    
    // Store bot response
    await conversationService.storeMessage(conversationId, responseText, 'Bot', userId);
    
    return res.status(200).json({ 
      text: responseText,
      conversationId
    });
  } catch (error: any) {
    logger.error(`Error generating text: ${error.message}`);
    return res.status(500).json({ error: `Failed to generate text: ${error.message}` });
  }
}

/**
 * Create or get a conversation
 */
export async function createOrGetConversation(req: Request, res: Response) {
  try {
    const { subject } = req.body;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    logger.info(`Creating/getting conversation for user ${userId} with subject ${subject || 'general'}`);
    
    const conversationId = await conversationService.createOrGetConversation(userId, subject);
    
    return res.status(200).json({ conversationId });
  } catch (error: any) {
    logger.error(`Error creating/getting conversation: ${error.message}`);
    return res.status(500).json({ error: `Failed to create/get conversation: ${error.message}` });
  }
}

/**
 * Store a message in a conversation
 */
export async function storeMessage(req: Request, res: Response) {
  try {
    const { conversationId, messageText, sender } = req.body;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!conversationId || !messageText || !sender) {
      return res.status(400).json({ error: 'Conversation ID, message text, and sender are required' });
    }
    
    logger.info(`Storing message in conversation ${conversationId}`);
    
    const messageId = await conversationService.storeMessage(
      conversationId,
      messageText,
      sender as any,
      userId
    );
    
    return res.status(200).json({ messageId });
  } catch (error: any) {
    logger.error(`Error storing message: ${error.message}`);
    return res.status(500).json({ error: `Failed to store message: ${error.message}` });
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(req: Request, res: Response) {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    logger.info(`Getting conversation history for ${conversationId}`);
    
    const history = await conversationService.getConversationHistory(conversationId);
    
    return res.status(200).json({ history });
  } catch (error: any) {
    logger.error(`Error getting conversation history: ${error.message}`);
    return res.status(500).json({ error: `Failed to get conversation history: ${error.message}` });
  }
}

export default {
  generateText,
  createOrGetConversation,
  storeMessage,
  getConversationHistory
}; 