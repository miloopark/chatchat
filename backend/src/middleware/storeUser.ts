import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../services/firebaseAdmin';

export const storeUserUponLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.');
    res.status(401).send('Unauthorized');
    return Promise.resolve(); // Explicitly return a resolved promise
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    
    if (!doc.exists) {
      await userRef.set({
        uid: uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        createdAt: new Date(),
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized');
    return Promise.resolve(); // Explicitly return a resolved promise on error
  }
};
