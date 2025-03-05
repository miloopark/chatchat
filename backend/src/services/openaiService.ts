import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

// Load environment variables from .ENV file
dotenv.config({ path: path.resolve(__dirname, '../../.ENV') });

// Get API key from environment variables
const apiKey = process.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error('OpenAI API key not found in environment variables');
  process.exit(1);
}

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'OpenAI-Beta': 'project_settings=true'
  }
});

/**
 * Generate a response from OpenAI based on the user's question and context
 * 
 * @param {string} userQuestion - The user's question
 * @param {Object} userContext - Context about the user (from questionnaire)
 * @param {Array} conversationHistory - Previous messages in this conversation
 * @returns {Promise<string>} The generated response
 */
export async function generateResponse(
  userQuestion: string, 
  userContext: any = {}, 
  conversationHistory: any[] = []
): Promise<string> {
  try {
    logger.info(`Generating response for question: ${userQuestion}`);
    
    // Create system prompt based on user context
    const systemPrompt = createSystemPrompt(userContext);
    
    // Prepare messages for the API call
    const messages = [
      { role: 'system', content: systemPrompt },
      // Add conversation history (limited to last 10 messages for context)
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.sender.toLowerCase() === 'user' ? 'user' : 'assistant', 
        content: msg.messageText
      })),
      { role: 'user', content: userQuestion }
    ];

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can change this to gpt-4 if needed
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    logger.info(`Generated response: ${responseText.substring(0, 100)}...`);
    
    return responseText;
  } catch (error: any) {
    logger.error(`Error generating OpenAI response: ${error.message}`);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Create a system prompt based on user context from the questionnaire
 */
function createSystemPrompt(userContext: any): string {
  // Default prompt if no context is available
  if (!userContext || Object.keys(userContext).length === 0) {
    return `You are a helpful, friendly AI assistant designed to help students learn.
      Your responses should be concise, educational, and engaging.
      If you don't know the answer to something, be honest about it.`;
  }
  
  // Enhanced prompt with user context
  const gradeLevel = userContext.grade_level || 'unknown';
  const speakingStyle = userContext.avatar_speaking_style || 'friendly';
  const preferredName = userContext.preferred_name || 'student';
  
  return `You are a helpful, friendly AI assistant designed to help students learn.
    You're speaking with ${preferredName}, who is in grade ${gradeLevel}.
    
    Adjust your explanations to be appropriate for this grade level. Use examples and analogies 
    that would be familiar to someone of this age and educational level.
    
    Your speaking style should be ${speakingStyle}.
    
    Your responses should be concise, educational, and engaging.
    If you don't know the answer to something, be honest about it.
    
    Additional context about the student:
    ${userContext.additional_info ? userContext.additional_info : 'No additional information provided.'}`;
}

export default openai; 