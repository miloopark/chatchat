import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Example static data
const conversations = [
  { id: 1, title: 'Conversation 1' },
  { id: 2, title: 'Conversation 2' },
  { id: 3, title: 'Conversation 3' },
  // Add more placeholder conversations as needed
];

const Sidebar = ({ open, toggleSidebar }) => {
  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      sx={{ // Styling for the Sidebar component
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          backgroundColor: '#F1D6FF',
          boxSizing: 'border-box',
        },
      }}
    >

      <List sx={{ paddingTop: '65px' }}> {/* Pushes conversation list down! */}
        {conversations.map((conversation) => (
          <ListItem button key={conversation.id}>
            <ListItemText primary={conversation.title} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
