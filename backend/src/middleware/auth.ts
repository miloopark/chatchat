import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { logger } from '../utils/logger';

// Add custom properties to the Request type
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

/**
 * Middleware to authenticate the user using Firebase Authentication
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  // For testing/development - bypass authentication
  const bypassAuth = true; // Set to false when ready to enforce authentication
  
  if (bypassAuth) {
    console.log('⚠️ Authentication bypassed for testing');
    return next();
  }
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 