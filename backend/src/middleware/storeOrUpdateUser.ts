import {db} from "../services/firebaseAdmin";

export const storeOrUpdateUser = async (userData: {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  firstTime?: boolean;
  surveyData?:{
    confirmation: boolean;
    name: string;
    gender: string;
    grade: string;
    learningPref: string;
    extraPref: string
  };
  
}) => {
  const userRef = db.collection("users").doc(userData.uid);

  try {
    const docSnapshot = await userRef.get();
    if (!docSnapshot.exists) {
      // Create a new user document with the initial creation date
      await userRef.set({
        ...userData,
        createdAt: new Date(),
      });
    } else {
      // Update the user document without modifying the createdAt field
      await userRef.update({
        ...userData,
        lastLogin: new Date(), // Keep or introduce the last login time
      });
    }
  } catch (error) {
    console.error("Error updating Firestore user document:", error);
    throw new Error("Firestore operation failed.");
  }
};