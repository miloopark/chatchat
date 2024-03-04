//import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import './ChatHistory.css';

interface IMessage {
    input: string;
    response: string;
}

interface ChatHistoryProps {
    messages: IMessage[];
}

const ChatHistory = ({ messages }: ChatHistoryProps) => {
    return (
        <Paper className="chat-history" style={{ backgroundColor: '#8158da' }}>
            <List>
                {messages.map((message: IMessage, index: number) => ( // Explicitly type `message` and `index`
                    <ListItem key={index} className="chat-message"> 
                        <ListItemText
                          primary={<span className="chat-message-input">{message.input}</span>}
                          secondary={<span className="chat-message-response">{message.response}</span>}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default ChatHistory;