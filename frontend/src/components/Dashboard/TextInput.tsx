import React from 'react';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import './TextInput.css';

// Assume this service is correctly implemented to handle sending messages
// and creating conversations if necessary.
import fetchGptResponseAndPostConversation from '../../services/conversationService';

interface InputProps {
  locked?: boolean;
  active?: boolean;
  value?: string;
  error?: string;
  label?: string;
  conversationId?: string; // Make it optional to handle new conversation scenario
  onSendFirstMessage?: (message: string) => void; // New prop for handling the first message
}

interface InputState {
  value: string;
  error: string;
}

class TextInput extends React.Component<InputProps, InputState> {
  constructor(props: InputProps) {
    super(props);
    this.state = {
      value: props.value || "",
      error: props.error || "",
    };
  }

  changeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: event.target.value, error: "" });
  };

  sendToChatGPT = async () => {
    const { value } = this.state;
    const { conversationId, onSendFirstMessage } = this.props;

    if (!value.trim()) return; // Ignore empty messages

    if (!conversationId && onSendFirstMessage) {
      onSendFirstMessage(value);
    } else if (conversationId) {
      await fetchGptResponseAndPostConversation(value, conversationId);
    }

    this.setState({ value: "" }); // Clear the input field after sending
  };

  handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent form submit
      this.sendToChatGPT();
    }
  };

  render() {
    const { value, error } = this.state;
    const { label } = this.props;
    const fieldClassName = `field ${value && "active"} ${error && "error"}`;

    return (
      <div className={fieldClassName}>
        <label htmlFor="input-field">
          {error || label}
        </label>
        <div className="input-button-container">
          <input
            id="input-field"
            type="text"
            value={value}
            placeholder={label}
            onChange={this.changeValue}
            onKeyPress={this.handleKeyPress}
          />
          <IconButton onClick={this.sendToChatGPT} style={{ color: "#620062" }} className="send-button">
            <SendIcon />
          </IconButton>
        </div>
      </div>
    );
  }
}

export default TextInput;
