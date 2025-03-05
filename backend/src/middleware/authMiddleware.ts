import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
      };
    }
  }
}

/**
 * Middleware that verifies the Firebase ID token sent by the client.
 * If the token is valid, it adds the decoded user info to req.user.
 */
export const verifyAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  logger.debug('Verifying authentication...');
  
  // Check if we're in development mode with auth bypass
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    logger.warn('⚠️ Auth bypass is enabled! Using test user ID.');
    req.user = { uid: 'test-user-id' };
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('No authorization token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split('Bearer ')[1];
  
  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name
    };
    
    logger.debug(`Authentication successful for user: ${req.user.uid}`);
    next();
  } catch (error: any) {
    logger.error(`Error verifying Firebase ID token: ${error.message}`);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 