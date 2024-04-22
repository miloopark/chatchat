import { db } from "../services/firebaseAdmin";

interface ConversationData {
  userId: string;
  lastMessagePreview?: string;
  lastUpdated: Date;
  createdAt: Date;
}

interface MessageData {
    conversationId: string; // Unique ID for the conversation
    sender: 'User' | 'Bot'; // Indicates if the message is from the User or the Bot
    messageText: string;
    createdAt?: Date;
  }

// Function to either fetch an existing conversation or create a new one
export const getOrCreateConversation = async (userId: string): Promise<string> => {
  const conversationsRef = db.collection("conversations");
  let conversationId = "";

  try {
    // Attempt to find an existing conversation for the user
    const snapshot = await conversationsRef.where("userId", "==", userId)
                                           .orderBy("lastUpdated", "desc")
                                           .limit(1)
                                           .get();

    if (!snapshot.empty) {
      // Use the existing conversation
      conversationId = snapshot.docs[0].id;
    } else {
      // No existing conversation found, create a new one
      const newConversationData: ConversationData = {
        userId,
        lastUpdated: new Date(),
        createdAt: new Date(),
      };
      const newConversationRef = await conversationsRef.add(newConversationData);
      conversationId = newConversationRef.id;
    }
  } catch (error) {
    console.error("Error in getting or creating a conversation:", error);
    throw new Error("Failed to get or create a conversation.");
  }

  return conversationId;
};

export const fetchConversations = async (userId: string) => {
    const conversationsRef = db.collection("conversations");
    const snapshot = await conversationsRef.where("userId", "==", userId)
                                           .orderBy("lastUpdated", "desc")
                                           .get();
    if (snapshot.empty) {
      console.log("No matching conversations found.");
      return [];
    }
  
    let conversations: { id: string; }[] = [];
    snapshot.forEach(doc => {
      conversations.push({ id: doc.id, ...doc.data() });
    });
  
    return conversations;
  };

export const fetchMessagesForConversation = async (conversationId: string): Promise<MessageData[]> => {
    console.log("Fetching messages for conversationId:", conversationId); // Debug log
    const messagesRef = db.collection("conversations").doc(conversationId).collection("messages");
    const snapshot = await messagesRef.orderBy("createdAt", "asc").get();
  
    if (snapshot.empty) {
      console.log(`No messages found for conversation ID ${conversationId}.`);
      return [];
    }
  
    const messages: MessageData[] = snapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure data conforms to MessageData interface; adjust as necessary.
      return {
        conversationId,
        sender: data.sender,
        messageText: data.messageText,
        createdAt: data.createdAt.toDate() // Assuming createdAt is stored as a Firestore Timestamp
      };
    });
  
    return messages;
  };