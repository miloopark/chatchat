import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
});

export default admin;
