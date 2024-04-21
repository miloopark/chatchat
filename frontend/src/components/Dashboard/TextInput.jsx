import React from "react";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import "./TextInput.css";

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: "",
      error: "",
      label: "Prompt",
      listening: false
    };
    this.speechRecognition = null;
  }

  changeValue = (event) => {
    this.setState({ value: event.target.value, error: "" });
  };

  speakOutLoud = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-US');
    speechSynthesis.speak(utterance);
  };

  sendToChatGPT = async () => {
    const { value } = this.state;
    const { conversationId } = this.props; // This prop should be passed from the parent component
    const userToken = sessionStorage.getItem('idToken'); // Get the token
  
    console.log('Sending message to ChatGPT:', value);
    console.log('Conversation ID:', conversationId);

    this.setState({ value: "" }); // Clear the input field
  
    try {
      const chatbotResponse = await fetch('api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ 
          prompt: value,
          conversationId: `Yivpf93DQu6PycyNjKOC` })
      });
  
      if (!chatbotResponse.ok) {
        const errorDetails = await chatbotResponse.text(); // Get error details from the response body
        console.error(`Error from chatbot API: ${chatbotResponse.status} - ${errorDetails}`);
        throw new Error(`Chatbot API responded with status: ${chatbotResponse.status}`);
      }
  
      const data = await chatbotResponse.json();
      const botResponse = data.text;
      this.speakOutLoud(botResponse);
      this.props.onResponseReceived(data.text);
  
      // Store the user's message
      const storeUserResponse = await fetch('api/store-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          conversationId,
          messageText: value,
          sender: 'User'
        })
      });
  
      if (!storeUserResponse.ok) {
        const errorDetails = await storeUserResponse.text();
        console.error(`Error storing user message: ${storeUserResponse.status} - ${errorDetails}`);
        throw new Error(`Error storing user message with status: ${storeUserResponse.status}`);
      }
  
      // Store the chatbot's response
      const storeBotResponse = await fetch('api/store-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          conversationId,
          messageText: botResponse,
          sender: 'Bot'
        })
      });
  
      if (!storeBotResponse.ok) {
        const errorDetails = await storeBotResponse.text();
        console.error(`Error storing bot response: ${storeBotResponse.status} - ${errorDetails}`);
        throw new Error(`Error storing bot response with status: ${storeBotResponse.status}`);
      }
  
    } catch (error) {
      console.error('Error in sendToChatGPT:', error);
      this.setState({ error: 'Failed to send message. Please try again.' });
    }
  };  

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.stopListening();
      this.sendToChatGPT();
    }
  };


  startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';
      this.speechRecognition.start();

      this.speechRecognition.onresult = event => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        this.setState({ value: transcript, listening: true });
      };

      this.speechRecognition.onerror = event => {
        console.error('SpeechRecognitionError:', event.error);
        this.setState({ listening: false });
      };

      this.speechRecognition.onend = () => {
        this.setState({ listening: false });
      };
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  };

  stopListening = () => {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = null;
      this.setState({ listening: false });
    }
  };

  toggleListening = () => {
    if (this.state.listening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  };

  render() {
    const { active, value, error, label } = this.state;
    const { locked } = this.props;
    const fieldClassName = `field ${((locked ? active : active || value) && "active")} ${locked && !active && "locked"}`;

    return (
      <div className={fieldClassName}>
        <label htmlFor={1} className={error && "error"}>
          {error || label}
        </label>
        <div className="input-button-container">
          <input
            id={1}
            type="text"
            value={value}
            placeholder={label}
            onChange={this.changeValue.bind(this)}
            onKeyPress={this.handleKeyPress.bind(this)}
            onFocus={() => !locked && this.setState({ active: true })}
            onBlur={() => !locked && this.setState({ active: false })}
          />
          <IconButton onClick={this.toggleListening} style={{ color: "#620062" }} className="mic-button">
            <MicIcon />
          </IconButton>
          <IconButton
            onClick={this.sendToChatGPT}
            style={{ color: "#620062" }} 
            className="send-button"
          >
            <SendIcon />
          </IconButton>
        </div>
      </div>
    );
  }
}

export default Input;