// frontend/src/services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  UserCredential,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { COLLECTIONS } from './CONSTANTS';

// Google sign-in
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process...');
    
    // Use the pre-configured googleProvider from config.ts
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    const user = result.user;
    
    console.log('Google sign-in successful:', { user: user.uid, hasToken: !!token });
    
    // Check if this is a new user
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const isNewUser = !userDoc.exists();
    
    console.log('User existence check:', { isNewUser, hasDoc: userDoc.exists() });
    
    if (isNewUser) {
      // Create a new user document for first-time users
      console.log('Creating new user document for first-time Google user');
      await createUserDocument(result);
      return { ...result, isNewUser: true };
    }
    
    return { ...result, isNewUser: false };
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
    }
    
    throw error;
  }
};

// Email/password sign-up
export const signUpWithEmailPassword = async (
  email: string, 
  password: string, 
  userData: {firstName?: string, lastName?: string, displayName?: string, [key: string]: any}
) => {
  try {
    console.log('Starting email/password sign-up...', { email });
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Email/password sign-up successful:', { uid: result.user.uid });
    
    // Update the user's display name if provided
    if (userData.displayName || (userData.firstName && userData.lastName)) {
      const displayName = userData.displayName || `${userData.firstName} ${userData.lastName}`;
      console.log('Updating user profile with display name:', displayName);
      await updateProfile(result.user, { displayName });
    }
    
    await createUserDocument(result, userData);
    return { ...result, isNewUser: true };
  } catch (error: any) {
    console.error('Error signing up with email/password:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please sign in instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address. Please check your email and try again.');
    }
    
    throw error;
  }
};

// Email/password sign-in
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    console.log('Starting email/password sign-in...', { email });
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email/password sign-in successful:', { uid: result.user.uid });
    return result;
  } catch (error: any) {
    console.error('Error signing in with email/password:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later or reset your password.');
    }
    
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    console.log('Signing out user...');
    await signOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData: {
  displayName?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  console.log('Updating user profile:', { uid: user.uid });
  
  try {
    const updates: any = {};
    
    // Update display name if provided
    if (userData.displayName && userData.displayName !== user.displayName) {
      await updateProfile(user, { displayName: userData.displayName });
      updates.displayName = userData.displayName;
      console.log('Display name updated');
    }
    
    // Email update requires re-authentication for security
    if (userData.email && userData.email !== user.email) {
      // For email updates, ideally need current password for reauthentication
      // This is simplified - in a real app, you might want to prompt for current password
      try {
        await updateEmail(user, userData.email);
        updates.email = userData.email;
        console.log('Email updated');
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          throw new Error('Email update requires recent login. Please sign out and sign in again before changing your email.');
        } else {
          throw error;
        }
      }
    }
    
    // Password update
    if (userData.password) {
      try {
        await updatePassword(user, userData.password);
        console.log('Password updated');
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          throw new Error('Password update requires recent login. Please sign out and sign in again before changing your password.');
        } else {
          throw error;
        }
      }
    }
    
    // Update Firestore user document if we have changes
    if (Object.keys(updates).length > 0) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
      console.log('User document updated with profile changes');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Create a user document in Firestore
export const createUserDocument = async (userCredential: UserCredential, additionalData: any = {}) => {
  const { user } = userCredential;
  
  // Reference to the user document
  const userRef = doc(db, 'users', user.uid);
  
  try {
    console.log('Creating/updating user document in Firestore:', { uid: user.uid });
    
    // Basic user data
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      ...additionalData
    };
    
    // Create/update the user document
    await setDoc(userRef, userData, { merge: true });
    console.log('User document created/updated successfully');
    return userRef;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Get current user data
export const getCurrentUserData = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('No user is currently signed in');
    return null;
  }
  
  try {
    console.log('Fetching user data from Firestore:', { uid: user.uid });
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      console.log('User document found');
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    console.log('No user document found');
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Function to reauthenticate the user (needed before sensitive operations)
export const reauthenticateUser = async (email: string, password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently logged in');
    }

    // Create credential with email and password
    const credential = EmailAuthProvider.credential(email, password);
    
    // Reauthenticate the user
    await reauthenticateWithCredential(user, credential);
    console.log('User reauthenticated successfully');
  } catch (error) {
    console.error('Reauthentication failed:', error);
    throw new Error('Authentication failed. Please check your password and try again.');
  }
};

// Function to update the user's email
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    await updateEmail(user, newEmail);
    console.log('Email updated successfully');
  } catch (error) {
    console.error('Email update failed:', error);
    throw new Error('Failed to update email. Please try again later.');
  }
};

// Function to update the user's password
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    
    await updatePassword(user, newPassword);
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Password update failed:', error);
    throw new Error('Failed to update password. Please try again later.');
  }
};