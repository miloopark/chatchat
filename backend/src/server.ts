import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import textCompletionRouter from './routes/textCompletionRouter';
import { logger } from './utils/logger';
import './config/firebase'; // Initialize Firebase

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.ENV') });

// Get port
const port = process.env.PORT || 3000;

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', textCompletionRouter);

// Start server
if (require.main === module) {
  app.listen(port, () => {
    logger.info(`
    ====================================
    🚀 Server running on port ${port}!
    ====================================
    
    • Health check: http://localhost:${port}/health
    • API endpoint: http://localhost:${port}/api/generate-text
    
    Authentication is ${process.env.BYPASS_AUTH === 'true' ? 'DISABLED' : 'ENABLED'} for API requests.
    Firebase Firestore is being used for conversation storage.
    `);
  });
}

export default app;
