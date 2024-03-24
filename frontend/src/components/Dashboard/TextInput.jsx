import React from "react";
//import { render } from "react-dom";
import "./TextInput.css";
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: (props.locked && props.active) || false,
      value: props.value || "",
      error: props.error || "",
      label: props.label || "Prompt"
    };
  }

  changeValue(event) {
    const value = event.target.value;
    this.setState({ value, error: "" });
  }

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
          <IconButton
            onClick={this.sendToChatGPT}
            style={{ color: "#620062" }} // Replace #hexcode with your desired hex color
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