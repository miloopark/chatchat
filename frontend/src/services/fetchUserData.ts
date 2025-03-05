import { auth } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Fetches user data from Firestore.
 * Uses the current authenticated user and fetches their document from Firestore.
 */
const fetchUserData = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Option 1: Get the data directly from Firestore (best for real-time data)
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    
    // Option 2: Get the data from your backend API (useful if you need to process data)
    /* 
    const idToken = await user.getIdToken();
    const response = await fetch("/api/get-user-data", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      return userData;
    } else {
      throw new Error(`Error fetching user data: ${response.statusText}`);
    }
    */
    
    return null;
  } catch (error) {
    console.error("fetchUserData error:", error);
    throw error;
  }
};

export default fetchUserData;
