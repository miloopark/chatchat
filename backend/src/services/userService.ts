import { db } from "../services/firebaseAdmin";

// Define an interface for the survey data
interface SurveyData {
  confirmation: boolean;
  name: string;
  gender: string;
  grade: string;
  learningPref: string;
  extraPref: string;
}

// Define an interface for the user data
interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  firstTime?: boolean; // This is managed internally and not expected as part of input
  surveyData?: SurveyData;
}

// Function to store or update user data
export const storeOrUpdateUser = async (
  userData: UserData,
): Promise<boolean> => {
  const userRef = db.collection("users").doc(userData.uid);

  try {
    const docSnapshot = await userRef.get();
    if (!docSnapshot.exists) {
      // If the user does not exist, create a new document
      await userRef.set({
        ...userData,
        createdAt: new Date(), // Directly setting here
      });
      return true; // Indicating it's the first time
    } else {
      // If the user exists, update their data without createdAt
      await userRef.update({
        ...userData,
        lastLogin: new Date(),
      });
      return false; // Indicating it's not the first time
    }
  } catch (error) {
    console.error("Error updating Firestore user document:", error);
    throw new Error("Firestore operation failed.");
  }
};

// Function to update user's survey data
export async function updateSurveyData(
  uid: string,
  surveyData: SurveyData,
): Promise<void> {
  const userRef = db.collection("users").doc(uid);

  try {
    await userRef.update({ surveyData });
  } catch (error) {
    console.error("Error updating survey data in Firestore:", error);
    throw new Error("Firestore operation failed.");
  }
}

export const getUserData = async (uid: string) => {
  const userRef = db.collection("users").doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error("User not found");
  }

  return doc.data();
};
