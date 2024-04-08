import React from "react";
//import { render } from "react-dom";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
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

  speakOutLoud = (text) => {
    this.props.onSpeakingChange(true); // Add this line
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'en-US');
  
    utterance.onend = () => {
      this.props.onSpeakingChange(false); // Add this line
    };
  
    speechSynthesis.speak(utterance);
  };

  // Call this method when Enter is pressed
  sendToChatGPT = () => {
    fetch('api/generate-text', { // Adjust the URL as necessary
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: this.state.value }) // Changed key from `message` to `prompt`
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.text); // Assuming you want to log the generated text
      this.speakOutLoud(data.text); // Speak out the response\
      this.props.onResponseReceived(data.text); // Call back
    })
    .catch(error => {
      console.error('Error:', error);
    });

    this.setState({ value: "" }); // Clear the input after sending the message    
  };

  handleKeyPress(event) {
    if (event.which === 13 || event.keyCode === 13) {
      event.preventDefault(); // Prevent the default form submit behavior
      this.sendToChatGPT(); // Send the message to ChatGPT API
    }
  }

  //Microphone

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