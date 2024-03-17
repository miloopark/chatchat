import { Request, Response, NextFunction } from 'express';
import admin from '../services/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

const validateFirebaseIdToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
    res.status(403).send('Unauthorized');
    return;
  }

  const idToken = req.headers.authorization.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req['user'] = decodedToken; // Add the decoded token to the request for downstream use
    next();
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
  }
};

export default validateFirebaseIdToken;
