import { Router } from 'express';

const router = Router();

router.post('/store-message', (req, res) => {
  const { message, conversationId, userId } = req.body;
  
  if (!message || !conversationId) {
    return res.status(400).json({ error: 'Message and conversationId are required' });
  }
  
  // Here you would typically store the message in a database
  console.log(`Storing message in conversation ${conversationId}: ${message}`);
  
  res.status(200).json({
    success: true,
    messageId: `msg_${Date.now()}`,
    timestamp: new Date().toISOString()
  });
});

export default router;
