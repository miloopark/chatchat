import express from 'express';
import chatController from '../controllers/chatController';
import { authenticateUser } from '../middleware/auth';
import { Router } from 'express';

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authenticateUser);

// Generate text from OpenAI
router.post('/generate-text', chatController.generateText);

// Create or get a conversation
router.post('/conversation', chatController.createOrGetConversation);

// Store a message
router.post('/store-message', chatController.storeMessage);

// Get conversation history
router.get('/conversation/:conversationId', chatController.getConversationHistory);

// Get a chat by ID
router.get('/chat/:id', (req, res) => {
  res.json({ message: 'Chat fetched', id: req.params.id });
});

// Create a new chat
router.post('/chat', (req, res) => {
  res.json({ message: 'Chat created', id: `chat_${Date.now()}` });
});

export default router; 