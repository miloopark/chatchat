import React from 'react';

interface Conversation {
  id: string;
  title: string; // Assuming title is a string. Adjust the type as necessary.
}


// Add necessary props for the conversation
export const Conversation = ({ title, onSelect }) => {
  return (
    <div onClick={onSelect} style={{ cursor: 'pointer', padding: '10px' }}>
      {title}
    </div>
  );
};

export default Conversation;
