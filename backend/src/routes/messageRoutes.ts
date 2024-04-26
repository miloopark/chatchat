import express from 'express';
import { validateFirebaseIdToken, AuthRequest } from '../middleware/validateFirebaseToken';
import { db } from "../services/firebaseAdmin";

interface MessageData {
  conversationId: string;
  sender: 'User' | 'Bot';
  messageText: string;
  createdAt?: Date;
}

const router = express.Router();

const storeMessage = async (messageData: MessageData): Promise<string> => {
  const conversationRef = db.collection("conversations").doc(messageData.conversationId);
  const messagesRef = conversationRef.collection("messages");

  try {
    const messageRef = await messagesRef.add({
      ...messageData,
      createdAt: new Date(),
    });

    await conversationRef.set({
      lastMessagePreview: messageData.messageText,
      lastUpdated: new Date(),
    }, { merge: true });

    return messageRef.id;
  } catch (error) {
    console.error("Error adding message to Firestore:", error);
    throw new Error("Firestore operation failed.");
  }
};

router.post("/store-message", validateFirebaseIdToken, async (req: AuthRequest, res) => {
  const { conversationId, messageText, sender } = req.body;

  if (!conversationId || !messageText || !sender) {
    return res.status(400).send("Missing required fields: conversationId, messageText, and sender are required.");
  }

  try {
    const messageId = await storeMessage({
      conversationId, 
      sender, 
      messageText
    });
    return res.status(200).send(`Message stored successfully with ID: ${messageId}`);
  } catch (error) {
    console.error("Failed to store message:", error);
    // Checking if the error is an instance of Error
    if (error instanceof Error) {
      return res.status(500).send(error.message);
    } else {
      return res.status(500).send("Internal Server Error");
    }
  }
});

export default router;
