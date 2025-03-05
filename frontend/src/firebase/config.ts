// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcLMmO5cMAxIaokRhiA6uTMtTfiBYHJbE",
  authDomain: "chatchat-ce029.firebaseapp.com",
  databaseURL: "https://chatchat-ce029-default-rtdb.firebaseio.com",
  projectId: "chatchat-ce029",
  storageBucket: "chatchat-ce029.firebasestorage.app",
  messagingSenderId: "985770957236",
  appId: "1:985770957236:web:f75add44cb0942afd77ae1",
  measurementId: "G-WN5GPFYFFE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Add scopes if needed
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;