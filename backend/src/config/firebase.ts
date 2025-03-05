import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.ENV') });

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // Use environment variables
  const firebaseConfig = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  };

  // Log what we're using (safely)
  console.log(`Initializing Firebase Admin SDK with project: ${firebaseConfig.projectId}`);
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey,
      }),
      databaseURL: firebaseConfig.databaseURL,
      storageBucket: firebaseConfig.storageBucket,
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

// Export the Firebase admin instance
export default admin;

// Convenience export for Firestore
export const db = admin.firestore(); 