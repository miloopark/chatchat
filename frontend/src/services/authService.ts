// Import the necessary Firebase functions
import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Function to handle Google sign-in
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // Sign-in successful
    // You can add additional behavior after successful sign-in if needed
  } catch (error) {
    // Handle errors here, such as displaying an error message
    console.error(error.message);
  }
};
