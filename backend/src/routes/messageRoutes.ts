import express from 'express';
import { validateFirebaseIdToken, AuthRequest } from '../middleware/validateFirebaseToken';
import { db } from "../services/firebaseAdmin";
import { getOrCreateConversation } from '../services/conversationService'; // Import the function

interface MessageData {
  conversationId: string; // Unique ID for the conversation
  sender: 'User' | 'Bot'; // Indicates if the message is from the User or the Bot
  messageText: string;
  createdAt?: Date;
}

// Function to store a message in the Firestore database
const storeMessage = async (messageData: MessageData) => {
  const conversationRef = db.collection("conversations").doc(messageData.conversationId);
  const messagesRef = conversationRef.collection("messages");

  try {
    // Add the message to the Firestore subcollection
    const messageRef = await messagesRef.add({
      ...messageData,
      createdAt: new Date(), // Firestore will automatically convert this to a Timestamp
    });

    // Update conversation metadata with the latest message details
    await conversationRef.update({
      lastMessagePreview: messageData.messageText,
      lastUpdated: new Date(),
    });

    return messageRef.id; // Returns the ID of the new message
  } catch (error) {
    console.error("Error adding message to Firestore:", error);
    throw new Error("Firestore operation failed.");
  }
};

const router = express.Router();

router.post("/store-message", validateFirebaseIdToken, async (req: AuthRequest, res) => {
  if (req.user) {
      try {
          // Check for the presence of required fields in the request body
          const { messageText } = req.body;
          if (!messageText) {
              return res.status(400).send("Missing required fields: messageText and subject are required.");
          }

          // Use the UID from the authenticated user to get or create a conversation
          const conversationId = await getOrCreateConversation(req.user.uid, 'math');
          // Call storeMessage with the structured data
          await storeMessage({
            conversationId, 
            sender: 'User', 
            messageText
          });

          return res.status(200).send("Message stored successfully");
      } catch (error) {
          console.error("Failed to store message:", error);
          return res.status(500).send("Internal Server Error");
      }
  } else {
      return res.status(403).send("Unauthorized");
  }
});



export default router;