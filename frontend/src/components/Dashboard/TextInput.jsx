import React from "react";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import IntIcon from '@mui/icons-material/StopCircle'
import axios from 'axios';
import "./TextInput.css";

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: (props.locked && props.active) || false,
      value: props.value || "",
      error: props.error || "",
      label: props.label || "Prompt",
      listening: false,
      audio: null,
    };
    this.speechRecognition = null;
    this.abortController = new AbortController();
  }

  changeValue(event) {
    const value = event.target.value;
    this.setState({ value, error: "" });
  }

  speakOutLoud = (text) => {
    axios.post('/api/text-to-speech', { text }, {
        responseType: 'blob' // Ensure axios handles the response as a Blob
    }).then(response => {
        const url = window.URL.createObjectURL(response.data);
        const audio = new Audio(url);
        audio.onended = () => {
            this.props.onSpeakingChange(false);
        };
        audio.play();
        this.setState({ audio });
        this.props.onSpeakingChange(true);
    }).catch(error => {
        console.error('Error:', error);
    });
};


  sendToChatGPT = async () => {
    const { value } = this.state;
    const { conversationId } = this.props;  // Ensure this prop is passed from the parent component
    const userToken = sessionStorage.getItem('idToken');  // Get the token
  
    console.log('Sending message to ChatGPT:', value);
    console.log('Conversation ID:', conversationId);
  
    this.setState({ value: "" });  // Clear the input field
  
    try {
      const chatbotResponse = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ 
          prompt: value,
          conversationId: conversationId  // Pass the conversationId to the server
        })
      });
  
      if (!chatbotResponse.ok) {
        const errorDetails = await chatbotResponse.text();  // Get error details from the response body
        console.error(`Error from chatbot API: ${chatbotResponse.status} - ${errorDetails}`);
        throw new Error(`Chatbot API responded with status: ${chatbotResponse.status}`);
      }
  
      const data = await chatbotResponse.json();
      const botResponse = data.text;
      this.speakOutLoud(botResponse);
      this.props.onResponseReceived(data.text);
  
      // Store the user's message
      const storeUserResponse = await fetch('/api/store-message', {
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
      const storeBotResponse = await fetch('/api/store-message', {
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
      this.setState({ error: 'Say something else!' });
    }
  };
  

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.stopListening();
      this.sendToChatGPT();
    }
  };

  componentWillUnmount(){
    this.abortController.abort();
  }


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
      this.setState({ listening: false });
      this.speechRecognition = null;
    }
  };

  toggleListening = () => {
    if (this.state.listening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  };

  toggleStopResponse = () => {
    const { audio } = this.state;
    if (audio) {
      audio.pause(); // Pauses  audio
      audio.currentTime = 0; // Optionally reset the audio
      this.props.onSpeakingChange(false);
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
        <IconButton onClick={this.toggleListening} style={{ color: "#620062", backgroundColor: "white", }} className="mic-button">
            <MicIcon />
        </IconButton>
        <IconButton onClick={this.toggleStopResponse} style={{ color: "#620062", backgroundColor: "white", }} className="stop-button">
            <IntIcon />
        </IconButton>
        <div className="input-button-container">
          <input
            id={1}
            type="text"
            value={value}
            placeholder={label}
            onChange={this.changeValue.bind(this)}
            onFocus={() => !locked && this.setState({ active: true })}
            onBlur={() => !locked && this.setState({ active: false })}
            style={{bottom: "40px"}}
          />
          <IconButton
            onClick={this.sendToChatGPT}
            style={{ color: "#620062", bottom: "40px" }} 
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
