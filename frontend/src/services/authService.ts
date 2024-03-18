import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  UserCredential 
} from 'firebase/auth';

// Function to handle sign-in with Google
export const signInWithGoogle = async (callback: (idToken: string) => void) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken(); // Obtain the ID token
    callback(idToken); // Pass the ID token to the callback
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
  }
};

// Function to handle user data sending to backend
export const sendUserDataToBackend = async (idToken: string, userData: { email: string, uid: string }) => {
  try {
    const response = await fetch('/api/store-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to store user data');
    }
    console.log("User data stored/updated successfully");
  } catch (error) {
    console.error("Error sending user data to backend:", error);
  }
};

// Function to handle sign-up with email and password
export const signUpWithEmailPassword = async (email: string, password: string) => {
  const auth = getAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    // Ensure email is treated as a string, even if null (fallback to an empty string or appropriate placeholder)
    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '', // Fallback to an empty string if null
    };
    // Directly sending userData and idToken to backend
    await sendUserDataToBackend(idToken, userData);
    return userCredential;
  } catch (error) {
    console.error("Error during Email/Password Sign-Up:", error);
  }
};

// Function to handle sign-in with email and password
export const signInWithEmailPassword = async (email: string, password: string): Promise<UserCredential | undefined> => {
  const auth = getAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    // Ensure email is always a string
    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email || '', // Fallback to an empty string if null
    };
    // Sending userData and idToken to backend
    await sendUserDataToBackend(idToken, userData);
    return userCredential;
  } catch (error) {
    console.error("Error during Email/Password Sign-In:", error);
  }
};

