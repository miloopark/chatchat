import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// Adjust the signature to accept a callback function that expects a string parameter
export const signInWithGoogle = async (callback: (idToken: string) => void) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken(); // Obtain the ID token
    callback(idToken); // Pass the ID token to the callback
  } catch (error) {
    console.error(error);
  }
};
