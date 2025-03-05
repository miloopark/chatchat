// index.ts (For Firebase Functions)

import * as functions from "firebase-functions";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import { logger } from './utils/logger';
import path from 'path';
import app from './app';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.ENV') });

// Simple express server
import express from 'express';
import cors from 'cors';
import textCompletionRouter from './routes/textCompletionRouter';

// Get port
const port = process.env.PORT || 3000;

// Create express app
const server = express();

// Middleware
server.use(cors());
server.use(express.json());

// Log requests
server.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
server.use('/api', textCompletionRouter);

// Health check
server.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create conversation endpoint
server.post('/api/conversation', (req, res) => {
  // For testing, just return a random conversation ID
  const conversationId = `conv_${Math.random().toString(36).substring(2, 15)}`;
  console.log(`Created conversation: ${conversationId}`);
  res.status(200).json({ conversationId });
});

// Start server
server.listen(port, () => {
  console.log(`
  ====================================
  🚀 Server running on port ${port}!
  ====================================
  
  • Health check: http://localhost:${port}/health
  • API endpoint: http://localhost:${port}/api/generate-text
  
  Authentication is currently DISABLED for testing.
  `);
});

// Export for Firebase Functions
exports.api = functions.https.onRequest(server);
