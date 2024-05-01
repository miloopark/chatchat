import { db } from "../services/firebaseAdmin";

interface ConversationData {
  userId: string;
  lastMessagePreview?: string;
  lastUpdated: Date;
  createdAt: Date;
  subject: string;
}

interface MessageData {
  conversationId: string; // Unique ID for the conversation
  sender: "User" | "Bot"; // Indicates if the message is from the User or the Bot
  messageText: string;
  createdAt?: Date;
}

// Refactored to use createConversationWithInitialMessage if no existing conversation is found
export const getOrCreateConversation = async (
  userId: string,
  subject: string,
  initialMessageText?: string,
  sender: "User" | "Bot" = "Bot",
): Promise<string> => {
  const conversationsRef = db.collection("conversations");
  let conversationId = "";

  try {
    // Attempt to find an existing conversation for the user with the specific subject
    const snapshot = await conversationsRef
      .where("userId", "==", userId)
      .where("subject", "==", subject)
      .orderBy("lastUpdated", "desc")
      .limit(1)
      .get();

    if (!snapshot.empty) {
      // Use the existing conversation
      conversationId = snapshot.docs[0].id;
    } else {
      // No existing conversation found; delegate to createConversationWithInitialMessage
      conversationId = await createConversationWithInitialMessage(
        userId,
        subject,
        sender,
      );
    }
  } catch (error) {
    console.error("Error in getting or creating a conversation:", error);
    throw new Error("Failed to get or create a conversation.");
  }

  return conversationId;
};

export const createConversationWithInitialMessage = async (
  userId: string,
  subject: string,
  sender: "User" | "Bot" = "Bot",
): Promise<string> => {
  const conversationsRef = db.collection("conversations");
  const newConversationData: ConversationData = {
    userId,
    lastUpdated: new Date(),
    createdAt: new Date(),
    subject: subject,
  };

  try {
    const conversationDocRef = await conversationsRef.add(newConversationData);
    const conversationId = conversationDocRef.id;
    let modelPrompt = `Role and Goal: The GPT is a teacher specialized in teaching ${subject} to kids 
    in Kindergarten through 6th grade, providing explanations and guidance in natural language suitable 
    for text-to-speech. It offers concise responses using simpler vocabulary appropriate for young students.
    Constraints: Responses must be concise to suit text-to-speech constraints and use simple vocabulary 
    appropriate for young children. Avoid complex language and technical jargon that could confuse young learners.
    Guidelines: The GPT should engage students in a friendly and supportive manner, encouraging learning and 
    curiosity about ${subject}. It should aim to clarify concepts and material clearly and effectively, with 
    an emphasis on understanding rather than rote learning. It should keep content and messages age-appropriate
    and reject prompts that are inappropriate for children. Clarification: The GPT should ask for clarification 
    when the user's queries are ambiguous or incomplete, ensuring that the responses are as helpful as possible.
    Personalization: The GPT should maintain a warm and encouraging tone, mimicking a supportive teacher's style.`;

    // Store the initial prompt
    await storeMessage({
      conversationId: conversationId,
      sender: sender,
      messageText: modelPrompt,
      createdAt: new Date(),
    });

    return conversationId; // Return the new conversation's document ID
  } catch (error) {
    console.error("Error creating new conversation in Firestore:", error);
    throw new Error("Firestore operation failed.");
  }
};

//

export const fetchConversations = async (userId: string) => {
  const conversationsRef = db.collection("conversations");
  const snapshot = await conversationsRef
    .where("userId", "==", userId)
    .orderBy("lastUpdated", "desc")
    .get();
  if (snapshot.empty) {
    console.log("No matching conversations found.");
    return [];
  }

  let conversations: { id: string }[] = [];
  snapshot.forEach((doc) => {
    conversations.push({ id: doc.id, ...doc.data() });
  });

  return conversations;
};

export const fetchMessagesForConversation = async (
  conversationId: string,
): Promise<MessageData[]> => {
  console.log("Fetching messages for conversationId:", conversationId); // Debug log
  const messagesRef = db
    .collection("conversations")
    .doc(conversationId)
    .collection("messages");
  const snapshot = await messagesRef.orderBy("createdAt", "asc").get();

  if (snapshot.empty) {
    console.log(`No messages found for conversation ID ${conversationId}.`);
    return [];
  }

  const messages: MessageData[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    // Ensure data conforms to MessageData interface; adjust as necessary.
    return {
      conversationId,
      sender: data.sender,
      messageText: data.messageText,
      createdAt: data.createdAt.toDate(), // Assuming createdAt is stored as a Firestore Timestamp
    };
  });

  return messages;
};

export const fetchConversationDetails = async (conversationId: string) => {
  const docRef = db.collection("conversations").doc(conversationId);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Conversation not found");
  }

  return doc.data();
};

export const storeMessage = async (
  messageData: MessageData,
): Promise<string> => {
  const conversationRef = db
    .collection("conversations")
    .doc(messageData.conversationId);
  const messagesRef = conversationRef.collection("messages");

  try {
    const messageRef = await messagesRef.add({
      ...messageData,
      createdAt: new Date(),
    });

    await conversationRef.set(
      {
        lastMessagePreview: messageData.messageText,
        lastUpdated: new Date(),
      },
      { merge: true },
    );

    return messageRef.id;
  } catch (error) {
    console.error("Error adding message to Firestore:", error);
    throw new Error("Firestore operation failed.");
  }
};
