import admin from 'firebase-admin';
import "dotenv/config";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`,
});

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
