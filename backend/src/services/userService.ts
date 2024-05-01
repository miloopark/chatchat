import {db} from "../services/firebaseAdmin";

interface SurveyData {
  confirmation: boolean;
  name: string;
  gender: string;
  grade: string;
  learningPref: string;
  extraPref: string;
}

interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  firstTime?: boolean;
  surveyData?: SurveyData;
}

/**
 * Store or update user data in Firestore.
 * @param {UserData} userData - The user data to store or update.
 * @return {Promise<boolean>} True if it's a new user, false otherwise.
 */
export const storeOrUpdateUser = async (
  userData: UserData,
): Promise<boolean> => {
  const userRef = db.collection("users").doc(userData.uid);

  try {
    const docSnapshot = await userRef.get();
    if (!docSnapshot.exists) {
      await userRef.set({
        ...userData,
        createdAt: new Date(),
      });
      return true;
    } else {
      await userRef.update({
        ...userData,
        lastLogin: new Date(),
      });
      return false;
    }
  } catch (error) {
    console.error("Error updating Firestore user document:", error);
    throw new Error("Firestore operation failed.");
  }
};

/**
 * Update user's survey data.
 * @param {string} uid - User's unique ID.
 * @param {SurveyData} surveyData - Survey data to be updated.
 * @return {Promise<void>}
 */
export async function updateSurveyData(
  uid: string,
  surveyData: SurveyData,
): Promise<void> {
  const userRef = db.collection("users").doc(uid);

  try {
    await userRef.update({surveyData});
  } catch (error) {
    console.error("Error updating survey data in Firestore:", error);
    throw new Error("Firestore operation failed.");
  }
}

/**
 * Retrieve user data from Firestore.
 * @param {string} uid - User's unique ID.
 * @return {Promise<any>} The user's data.
 */
export const getUserData = async (uid: string) => {
  const userRef = db.collection("users").doc(uid);
  const doc = await userRef.get();

  if (!doc.exists) {
    throw new Error("User not found");
  }

  return doc.data();
};
