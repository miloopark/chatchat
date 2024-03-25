import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { db } from '../../services/firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';

// Define the Conversation interface
interface Conversation {
  id: string;
  title: string;
}

const Sidebar = ({ open, toggleSidebar, handleConversationSelect }: { open: boolean; toggleSidebar: () => void, handleConversationSelect: (id: string) => void }) => {
  // Use the Conversation interface to type the state
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'conversations'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const conversationsArray: Conversation[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'Untitled', // Provide a default title if none is found
      }));
      setConversations(conversationsArray);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      <List>
        {conversations.map((conversation) => (
          <ListItem button key={conversation.id} onClick={() => handleConversationSelect(conversation.id)}>
            <ListItemText primary={conversation.title} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
