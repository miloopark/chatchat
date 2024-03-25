import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebaseConfig'; // Make sure this is the correct path
import { collection, doc, onSnapshot } from 'firebase/firestore'; // Import necessary functions

interface Message {
  type: 'user' | 'bot';
  text: string;
}

const ChatHistory = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Reference to the conversation document
    const docRef = doc(db, 'conversations', conversationId);

    // Set up real-time subscription
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Check if the messages field exists and is an array
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages as Message[]);
        }
      } else {
        console.log("No such document!");
      }
    }, (err) => {
      console.error('Firestore subscription error: ', err);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [conversationId]);

  return (
    <div>
      {messages.map((message, index) => (
        <div key={index} style={{ textAlign: message.type === 'user' ? 'left' : 'right' }}>
          <p>{message.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;
