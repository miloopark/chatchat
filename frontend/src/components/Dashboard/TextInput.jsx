import React from "react";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
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
      listening: false
    };
    this.speechRecognition = null;
  }

  changeValue(event) {
    const value = event.target.value;
    this.setState({ value, error: "" });
  }

  // Update speakOutLoud function to use ElevenLabs API
  speakOutLoud = (text) => {
    const XI_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY; // Replace with your ElevenLabs API key
    const VOICE_ID = 'xtxNoADSfR8J98ui46Ny'; // Replace with your chosen voice ID

    axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      text: text,
      model_id: "eleven_multilingual_v2", // or any other model you prefer
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8
      }
    }, {
      headers: {
        "xi-api-key": XI_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      responseType: 'blob' // Important to handle binary data
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const audio = new Audio(url);
      audio.onended = () => {
        this.props.onSpeakingChange(false);
      };
      audio.play();
      this.props.onSpeakingChange(true);
    }).catch(error => {
      console.error('Error:', error);
    });
  };

  sendToChatGPT = async () => {
    const { value } = this.state;
    const { conversationId } = this.props; // This prop should be passed from the parent component
    const userToken = sessionStorage.getItem('idToken'); // Get the token
  
    console.log('Sending message to ChatGPT:', value);
    console.log('Conversation ID:', conversationId);

    this.setState({ value: "" }); // Clear the input field
  
    try {
      const chatbotResponse = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({ 
          prompt: value,
          conversationId: conversationId })
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

  render() {
    const { active, value, error, label } = this.state;
    const { locked } = this.props;
    const fieldClassName = `field ${((locked ? active : active || value) && "active")} ${locked && !active && "locked"}`;

    return (
      <div className={fieldClassName}>
        <label htmlFor={1} className={error && "error"}>
          {error || label}
        </label>
        <IconButton onClick={this.toggleListening} style={{ color: "#620062" }} className="mic-button">
            <MicIcon />
          </IconButton>
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
