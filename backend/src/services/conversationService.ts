import admin, { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, serverTimestamp, 
  DocumentReference, addDoc, updateDoc 
} from 'firebase/firestore';

interface ConversationData {
  userId: string;
  subject: string;
  lastMessagePreview?: string;
  lastUpdated: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
}

interface MessageData {
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: admin.firestore.Timestamp;
}

const conversationsCollection = db.collection('conversations');
const messagesCollection = db.collection('messages');

/**
 * Create a new conversation or get an existing one by subject
 */
export async function getOrCreateConversation(userId: string, subject = 'General'): Promise<string> {
  try {
    // Check if a conversation with this user and subject already exists
    const existingConversationsSnapshot = await conversationsCollection
      .where('userId', '==', userId)
      .where('subject', '==', subject)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    // If a conversation exists, return its ID
    if (!existingConversationsSnapshot.empty) {
      return existingConversationsSnapshot.docs[0].id;
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
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    throw error;
  }
}

/**
 * Store a message in a conversation
 */
export async function storeMessage(
  conversationId: string, 
  sender: 'user' | 'assistant', 
  content: string
): Promise<string> {
  try {
    // Get the conversation to ensure it exists and get the userId
    const conversationDoc = await conversationsCollection.doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Create a message document
    const messageId = uuidv4();
    await messagesCollection.doc(messageId).set({
      conversationId,
      sender,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update the conversation's lastUpdated timestamp and message count
    // Also update the preview with the first 50 characters of the message
    await conversationsCollection.doc(conversationId).update({
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      messageCount: admin.firestore.FieldValue.increment(1),
      lastMessagePreview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    });

    console.log(`Stored message from ${sender} in conversation: ${conversationId}`);
    return messageId;
  } catch (error) {
    console.error('Error in storeMessage:', error);
    throw error;
  }
}

/**
 * Get all messages for a conversation
 */
export async function getConversationHistory(conversationId: string): Promise<any[]> {
  try {
    // Check if the conversation exists
    const conversationDoc = await conversationsCollection.doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new Error('Conversation not found');
    }

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
    console.error('Error in getConversationHistory:', error);
    throw error;
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<any[]> {
  try {
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
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    throw error;
  }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<boolean> {
  try {
    // Verify the conversation belongs to this user
    const conversationDoc = await conversationsCollection.doc(conversationId).get();
    if (!conversationDoc.exists) {
      throw new Error('Conversation not found');
    }
    
    const conversationData = conversationDoc.data();
    if (conversationData?.userId !== userId) {
      throw new Error('Unauthorized: This conversation does not belong to the current user');
    }

    // Delete all messages in the conversation first
    const messagesSnapshot = await messagesCollection
      .where('conversationId', '==', conversationId)
      .get();
    
    const batch = db.batch();
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Then delete the conversation itself
    batch.delete(conversationsCollection.doc(conversationId));
    
    // Commit the batch
    await batch.commit();
    
    console.log(`Deleted conversation ${conversationId} and all its messages`);
    return true;
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    throw error;
  }
}

/**
 * Get user's questionnaire responses
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} The questionnaire responses or null if not found
 */
export async function getUserQuestionnaireResponses(userId: string): Promise<any | null> {
  try {
    logger.info(`Getting questionnaire responses for user ${userId}`);
    
    const questionnaireRef = doc(db, 'questionnaires', userId);
    const questionnaireDoc = await getDoc(questionnaireRef);
    
    if (questionnaireDoc.exists()) {
      return questionnaireDoc.data().responses || null;
    }
    
    return null;
  } catch (error: any) {
    logger.error(`Error getting questionnaire responses: ${error.message}`);
    return null;
  }
}

export default {
  getOrCreateConversation,
  storeMessage,
  getConversationHistory,
  getUserConversations,
  deleteConversation,
  getUserQuestionnaireResponses
};
