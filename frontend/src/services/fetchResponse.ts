import { auth } from "../firebase/config";

const fetchGptResponse = async (promptText: string): Promise<string> => {
  // Check if currentUser exists before trying to call getIdToken
  if (!auth.currentUser) {
    throw new Error("User not authenticated");
  }

  try {
    const token = await auth.currentUser.getIdToken();
    const backendUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api/generate-text" // Development URL
        : "/api/generate-text"; // Production URL (assuming same host and port)

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: promptText }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error fetching response:", error);
    throw error; // Re-throw the error to handle it in the calling component
  }
};

export default fetchGptResponse;
