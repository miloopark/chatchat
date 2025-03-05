import {Request, Response, NextFunction} from "express";
import admin from "../config/firebase";
import {logger} from "../utils/logger";

export const validateFirebaseIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // For testing purposes, bypass authentication
  const bypassAuth = true;
  
  if (bypassAuth) {
    logger.info('⚠️ Authentication bypassed for testing');
    return next();
  }
  
  logger.info('Checking if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
      !(req.cookies && req.cookies.__session)) {
    logger.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    logger.info('Found "Authorization" header');
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if(req.cookies) {
    logger.info('Found "__session" cookie');
    idToken = req.cookies.__session;
  } else {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    logger.info('ID Token correctly decoded', decodedIdToken);
    // @ts-ignore - Add user to request
    req.user = decodedIdToken;
    return next();
  } catch (error) {
    logger.error('Error while verifying Firebase ID token:', error);
    return res.status(403).json({ error: 'Unauthorized' });
  }
};
