import express from 'express';
import { validateFirebaseIdToken, AuthRequest } from '../middleware/validateFirebaseToken';
import { db } from "../services/firebaseAdmin";

// Define the structure for our conversation data
interface ConversationData {
  userId: string; // ID of the user starting the conversation with the bot
  lastMessagePreview?: string; // Optional: Preview of the last message sent
  lastUpdated: Date; // Timestamp of when the conversation was last updated
  createdAt: Date; // Timestamp of when the conversation was created
}

// Function to create a new conversation in the Firestore database
const createConversation = async (userId: string): Promise<string> => {
  const conversationsRef = db.collection("conversations");
  const newConversationData: ConversationData = {
    userId,
    lastUpdated: new Date(),
    createdAt: new Date(),
  };

  try {
    const docRef = await conversationsRef.add(newConversationData);
    return docRef.id; // Return the new conversation's document ID
  } catch (error) {
    console.error("Error creating new conversation in Firestore:", error);
    throw new Error("Firestore operation failed.");
  }
};

const router = express.Router();

router.post("/create-conversation", validateFirebaseIdToken, async (req: AuthRequest, res) => {
    if (req.user) {
        try {
            // Use the UID from the authenticated user to create a new conversation
            const conversationId = await createConversation(req.user.uid);

            res.status(200).json({ conversationId: conversationId, message: "Conversation created successfully" });
        } catch (error) {
            console.error("Failed to create conversation:", error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(403).send("Unauthorized");
    }
});

export default router;