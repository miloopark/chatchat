import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const signInWithGoogle = async (callback: () => void) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
    // Sign-in successful, call the callback function
    callback();
  } catch (error) {
    console.error(error);
  }
};
