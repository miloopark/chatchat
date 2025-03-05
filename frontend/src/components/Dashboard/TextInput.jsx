import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import "./TextInput.css";

// Convert to a forwardRef component to allow the parent to access its methods
const TextInput = forwardRef((props, ref) => {
  const {
    locked = false,
    active: initialActive = false,
    value: initialValue = "",
    label = "Prompt",
    conversationId,
    onConversationCreated,
    onSendMessage,
    onResponseReceived,
    onSpeakingStart,
    onSpeakingStop
  } = props;

  // State variables
  const [active, setActive] = useState(initialActive);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [debug, setDebug] = useState(true); // Set to true to enable debug logging
  
  const inputRef = useRef(null);

  // Expose methods to the parent component through the ref
  useImperativeHandle(ref, () => ({
    sendMessage: (message, fromSpeech = false) => {
      if (debug) console.log("[TextInput Debug] Sending message via ref:", message, "fromSpeech:", fromSpeech);
      handleSubmit(message, fromSpeech);
    },
    clearInput: () => {
      setValue("");
    }
  }));

  const changeValue = (event) => {
    setValue(event.target.value);
    setError("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (value.trim()) {
        handleSubmit(value);
      }
    }
  };

  // Clear the input field in a separate function to ensure it happens
  const clearInputField = () => {
    setValue("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      // Cleanup
    };
  }, []);

  useEffect(() => {
    // If the parent component provides a new value, update the state
    if (initialValue !== value && initialValue !== undefined) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const debugLog = (message, data) => {
    if (debug) {
      console.log(`[TextInput Debug] ${message}`, data || '');
    }
  };

  // Helper function to get user-specific storage key
  const getUserStorageKey = (key) => {
    const idToken = sessionStorage.getItem("idToken");
    if (!idToken) return key;
    
    // Try to extract user info from token
    try {
      // JWT tokens have format: header.payload.signature
      const parts = idToken.split('.');
      if (parts.length !== 3) return key;
      
      // Decode the payload
      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.user_id || payload.sub;
      
      if (userId) {
        return `user_${userId}_${key}`;
      }
    } catch (error) {
      console.warn("Could not parse JWT token", error);
    }
    
    return key;
  };

  // Safe storage getters and setters
  const getSessionItem = (key) => {
    return sessionStorage.getItem(getUserStorageKey(key));
  };

  const setSessionItem = (key, value) => {
    sessionStorage.setItem(getUserStorageKey(key), value);
  };

  const removeSessionItem = (key) => {
    sessionStorage.removeItem(getUserStorageKey(key));
  };

  // Create a new conversation
  const createNewConversation = async (token) => {
    try {
      console.log("Creating new conversation from TextInput...");
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject: "general" }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create conversation: ${response.status}`);
      }
      
      const conversationData = await response.json();
      const newId = conversationData.conversationId;
      
      // Store in session storage for persistence using user-specific key
      setSessionItem('currentConversationId', newId);
      
      // Update the parent component
      if (onConversationCreated) {
        onConversationCreated(newId);
      }
      
      console.log("Created new conversation:", newId);
      return newId;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      setError(`Failed to create conversation: ${error.message}`);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (messageOverride = null, fromSpeech = false) => {
    try {
      const message = messageOverride || value.trim();

      if (message === "") return;

      // Clear input field immediately for better user experience
      if (!messageOverride) {
        clearInputField();
      }

      if (!fromSpeech) { // Only call onSendMessage if not from speech (already in UI)
        if (debug) console.log("[TextInput Debug] Sending API request with:", { message });
        onSendMessage && onSendMessage(message);
      } else {
        if (debug) console.log("[TextInput Debug] Message from speech, skipping onSendMessage callback");
      }

      // Lock input during request
      setIsSending(true);

      // Get the authentication token
      const userToken = sessionStorage.getItem("idToken");
      if (!userToken) {
        setError("You must be logged in to send messages");
        setIsSending(false);
        return;
      }
      
      // Create a conversation if needed or verify existing one
      let currentConversationId = conversationId;
      
      if (!currentConversationId) {
        // No conversation ID provided, create a new one
        currentConversationId = await createNewConversation(userToken);
        if (!currentConversationId) {
          throw new Error("Failed to create a conversation");
        }
      }
      
      // Store the original message value
      const originalMessage = message;
      
      // Debugging information about the request
      debugLog("Sending API request with:", {
        userToken: userToken ? `${userToken.substring(0, 10)}...` : "missing",
        conversationId: currentConversationId,
        message: originalMessage
      });
      
      // Create a new AbortController for this specific request
      const controller = new AbortController();
      
      // Generate a response from the API
      console.log(`Sending message to OpenAI API via conversation: ${currentConversationId}`);
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          prompt: originalMessage,
          conversationId: currentConversationId,
        }),
        signal: controller.signal,
      });
      
      // Error handling
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("Server error:", errorData);
        } catch (e) {
          // If the response isn't valid JSON
          console.error("Response error:", response.status, response.statusText);
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        
        // Check if it's a 'conversation not found' error
        if (response.status === 404 || 
            (errorData.details && errorData.details.includes("not found"))) {
          console.log("Conversation not found, creating a new one...");
          
          // Clear the invalid conversation ID
          removeSessionItem('currentConversationId');
          
          // Create a new conversation
          const newConversationId = await createNewConversation(userToken);
          
          if (newConversationId) {
            // Try sending the message again with the new conversation ID
            console.log(`Retrying with new conversation ID: ${newConversationId}`);
            
            const retryResponse = await fetch("/api/generate-text", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                prompt: originalMessage,
                conversationId: newConversationId,
              }),
            });
            
            if (!retryResponse.ok) {
              throw new Error(`Retry failed: ${retryResponse.status} ${retryResponse.statusText}`);
            }
            
            const data = await retryResponse.json();
            console.log("Retry successful, response received:", data);
            
            if (data.conversationId && onConversationCreated) {
              onConversationCreated(data.conversationId);
              setSessionItem('currentConversationId', data.conversationId);
            }
            
            if (onResponseReceived) {
              onResponseReceived(data.text);
            }
            
            if (onSpeakingStart) {
              onSpeakingStart(data.text);
            }
            
            return;
          }
        }
        
        if (errorData.openaiError) {
          setError(`OpenAI API error: ${errorData.details || errorData.error}`);
          setIsSending(false);
          return;
        }
        
        throw new Error(errorData.error || errorData.details || `Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Response received from OpenAI API:", data);
      
      // Store the conversation ID from the response
      if (data.conversationId && onConversationCreated) {
        if (data.conversationId !== currentConversationId) {
          console.log(`Server returned a different conversation ID: ${data.conversationId}`);
        }
        onConversationCreated(data.conversationId);
        setSessionItem('currentConversationId', data.conversationId);
      }
      
      // Call the callback for when a response is received
      if (onResponseReceived) {
        onResponseReceived(data.text);
      }
      
      // Start speaking the response if needed
      if (onSpeakingStart) {
        onSpeakingStart(data.text);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error("Error sending message:", error);
        setError(`Failed to send message: ${error.message}. Please try again.`);
      }
    } finally {
      setIsSending(false);
      // Focus the input field again
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Style the input container and button for proper vertical alignment
  const inputContainerStyle = {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  };
  
  const sendButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1,
  };

  const fieldClassName = `field ${(locked ? "locked" : active ? "active" : "")}`;

  return (
    <div className={fieldClassName}>
      <div style={inputContainerStyle}>
        <input
          id={1}
          type="text"
          value={value}
          placeholder={isSending ? "Sending..." : label}
          onChange={changeValue}
          onKeyPress={handleKeyPress}
          onFocus={() => !locked && setActive(true)}
          onBlur={() => !locked && setActive(false)}
          ref={inputRef}
          disabled={isSending}
        />
        
        <IconButton 
          className="send-button" 
          onClick={() => {
            if (value.trim()) {
              handleSubmit(value);
            }
          }}
          style={sendButtonStyle}
          disabled={isSending || !value.trim()}
        >
          <SendIcon />
        </IconButton>
      </div>
      
      {error && <label className="error">{error}</label>}
    </div>
  );
});

// Add PropTypes for better type checking
TextInput.propTypes = {
  locked: PropTypes.bool,
  active: PropTypes.bool,
  value: PropTypes.string,
  label: PropTypes.string,
  conversationId: PropTypes.string,
  onConversationCreated: PropTypes.func,
  onSendMessage: PropTypes.func,
  onResponseReceived: PropTypes.func,
  onSpeakingStart: PropTypes.func,
  onSpeakingStop: PropTypes.func
};

export default TextInput;
