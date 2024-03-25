import admin from  './firebaseAdmin';
import {db} from './firebaseAdmin';

interface Message {
  userId: string;
  message: string;
  timestamp: FirebaseFirestore.FieldValue;
}

interface Conversation {
  conversationId: string;
  participants: string[];
  messages: Message[];
}

class ConversationService {
  private collectionRef = db.collection('conversations');

  async createOrUpdateConversation(conversationId: string, userId: string, message: string): Promise<void> {
    const docRef = this.collectionRef.doc(conversationId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      await docRef.set({
        conversationId,
        participants: [userId], // Adjust as needed
        messages: [{ userId, message, timestamp: admin.firestore.FieldValue.serverTimestamp() }],
      });
    } else {
      await docRef.update({
        messages: admin.firestore.FieldValue.arrayUnion({ userId, message, timestamp: admin.firestore.FieldValue.serverTimestamp() }),
      });
    }
  }

  async getConversation(conversationId: string): Promise<Conversation | undefined> {
    const docRef = this.collectionRef.doc(conversationId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) return undefined;

    return docSnapshot.data() as Conversation;
  }
}

export const conversationService = new ConversationService();
