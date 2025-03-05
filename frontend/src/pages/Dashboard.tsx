import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authProvider";
import TextInput from "../components/Dashboard/TextInput";
import Avatar from "../components/Dashboard/Avatar";
import IconButton from "@mui/material/IconButton";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/StopCircle";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import InfoIcon from "@mui/icons-material/Info";
import SendIcon from "@mui/icons-material/Send";
import "../App.css";
import { hasCompletedQuestionnaire } from "../services/questionnaireService";
import {
  useSpeechToText,
  useAudioPlayer,
  textToSpeechElevenLabs
} from '../services/speechService';
import styled from 'styled-components';

// Debug flag for more verbose logging
const DEBUG = true;

// Define Message interface for type safety
interface Message {
  id?: string;
  text?: string;
  content?: string;
  sender: string;
  timestamp?: string;
}

const InputButtonContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  
  .MuiIconButton-root {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State variables
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState<boolean>(true);
  const [hasQuestionnaire, setHasQuestionnaire] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<any>(null); // TextInput component ref
  
  // Use the updated speech hooks
  const {
    transcript,
    isListening,
    errorMessage: speechError,
    startListening,
    stopListening,
    resetTranscript,
    clearError,
    usingFallbackMode
  } = useSpeechToText();
  
  const { isPlaying, play, stop } = useAudioPlayer();

  // Storage utility functions
  const getUserStorageKey = (key: string): string => {
    const prefix = currentUser?.uid ? `user_${currentUser.uid}_` : '';
    return `${prefix}${key}`;
  };

  const getSessionItem = (key: string): string | null => {
    return sessionStorage.getItem(getUserStorageKey(key));
  };

  const setSessionItem = (key: string, value: string): void => {
    sessionStorage.setItem(getUserStorageKey(key), value);
  };

  const removeSessionItem = (key: string): void => {
    sessionStorage.removeItem(getUserStorageKey(key));
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // No need to clean up dismissTimerRef anymore
    };
  }, []);

  // Create a new conversation
  const createNewConversation = async (token: string, subject = "general"): Promise<string | null> => {
    try {
      if (DEBUG) console.log("Creating new conversation...");
      setError(null);
      
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ subject }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const newId = data.conversationId;
        setConversationId(newId);
        setSessionItem('currentConversationId', newId);
        if (DEBUG) console.log("Created new conversation:", newId);
        return newId;
      } else {
        const errorData = await response.json();
        console.error("Failed to create conversation:", errorData);
        setError(`Failed to create conversation: ${errorData.error || 'Unknown error'}`);
        return null;
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError(`Network error while creating conversation: ${error}`);
      return null;
    }
  };

  // Fetch conversation history
  const fetchConversationHistory = async (convoId: string, token: string) => {
    try {
      setError(null);
      if (DEBUG) console.log(`Fetching conversation history for ID: ${convoId}`);
      
      const response = await fetch(`/api/conversation/${convoId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch conversation history:", errorData);
        
        if (response.status === 403) {
          setError("You don't have permission to view this conversation.");
          removeSessionItem('currentConversationId');
          throw new Error("Access denied: This conversation belongs to another user");
        } else if (response.status === 404) {
          setError("Conversation not found. Creating a new one...");
          removeSessionItem('currentConversationId');
          throw new Error("Conversation not found");
        } else {
          throw new Error(errorData.error || "Failed to fetch conversation");
        }
      }
      
      const data = await response.json();
      
      if (currentUser && data.userId && data.userId !== currentUser.uid) {
        console.error("Conversation does not belong to current user");
        setError("You don't have permission to view this conversation.");
        removeSessionItem('currentConversationId');
        throw new Error("Access denied: This conversation belongs to another user");
      }
      
      // Format messages for display
      const formattedMessages = data.messages.map((msg: any) => ({
        id: msg.id || String(Date.now() + Math.random()),
        text: msg.content, // Map content to text for consistency
        sender: msg.sender === 'user' ? 'user' : 'bot',
        timestamp: msg.timestamp
      }));
      
      setMessages(formattedMessages);
      if (DEBUG) console.log("Loaded conversation history:", formattedMessages.length, "messages");
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      throw error;
    }
  };

  // Clear all session storage and create a new conversation
  const clearAllAndCreateNewConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Reset speech state
      resetTranscript();
      if (isListening) {
        stopListening();
      }
      
      // Clear all session storage for this user
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes(currentUser?.uid || '')) {
          sessionStorage.removeItem(key);
        }
      });
      
      removeSessionItem('currentConversationId');
      setConversationId(null);
      setMessages([]);
      
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        sessionStorage.setItem("idToken", token);
        
        const newId = await createNewConversation(token);
        setError("Everything has been reset successfully. Starting fresh with a new conversation.");
      }
    } catch (error) {
      console.error("Failed to clear session storage:", error);
      setError(`Failed to reset everything: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user sending a message - updates UI only
  const handleSendMessage = (text: string, fromSpeech = false) => {
    if (DEBUG) console.log("Dashboard: handleSendMessage called with text:", text, "fromSpeech:", fromSpeech);
    
    // If the message came from speech recognition and we already added it to the UI, don't add it again
    if (fromSpeech) {
      if (DEBUG) console.log("Message came from speech and already in UI, skipping handleSendMessage UI update");
      return;
    }
    
    const newMessage: Message = {
      id: String(Date.now()),
      text: text,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Handle AI response - updated to use the new speech service
  const handleResponseReceived = async (responseText: string) => {
    if (DEBUG) console.log("Dashboard: handleResponseReceived called with text:", responseText);
    const newMessage: Message = {
      id: String(Date.now()),
      text: responseText,
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);

    // Convert response to speech if in voice mode
    if (voiceMode) {
      try {
        // Set speaking state immediately to trigger avatar animation
        setIsSpeaking(true);
        if (DEBUG) console.log("Dashboard: Setting speaking state to true before TTS");
        
        // Use ElevenLabs for TTS
        const speechResult = await textToSpeechElevenLabs(responseText);
        
        // Play the audio
        play(speechResult.audioUrl, () => {
          setIsSpeaking(false);
        });
      } catch (error) {
        console.error('Failed to convert text to speech:', error);
        setIsSpeaking(false);
      }
    }
  };

  // Handle speech state changes - updated to sync with isPlaying
  const handleSpeakingStart = async (text: string) => {
    try {
      setIsSpeaking(true); // Start speaking animation immediately
      
      // Use ElevenLabs for TTS
      const speechResult = await textToSpeechElevenLabs(text);
      
      // Play the audio
      play(speechResult.audioUrl, () => {
        setIsSpeaking(false); // Stop speaking animation when audio ends
      });
    } catch (error) {
      console.error("Error in handleSpeakingStart:", error);
      setIsSpeaking(false);
    }
  };

  const handleSpeakingStop = () => {
    stop();
    setIsSpeaking(false);
  };

  // Voice interaction handlers - modified to remove info messages
  const handleStartListening = async () => {
    try {
      startListening();
      resetTranscript();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const handleStopListening = async () => {
    try {
      // Stop listening and get the transcribed text
      stopListening((text) => {
        if (text && text.trim()) {
          // Create a new message
          const newMessage: Message = {
            id: `msg_${Date.now()}`,
            content: text,
            sender: "user",
            timestamp: new Date().toISOString(),
          };
          
          // Update the UI with the new message
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          
          // Use the TextInput ref to send the message through the regular flow
          if (textInputRef.current) {
            textInputRef.current.sendMessage(text, true);
          }
        } else {
          // Remove showInfoMessage call
        }
      });
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const handleSpeechSubmit = () => {
    if (transcript && transcript.trim()) {
      handleSendMessage(transcript); // Update UI
      
      // Send the speech text to the OpenAI API using the TextInput's sendMessage method
      if (textInputRef.current && typeof textInputRef.current.sendMessage === 'function') {
        if (DEBUG) console.log("Sending speech text to OpenAI API via submit button:", transcript);
        textInputRef.current.sendMessage(transcript);
        resetTranscript();
      } else {
        console.error("TextInput ref or sendMessage method not available", textInputRef.current);
      }
    } else {
      // Remove showInfoMessage call
    }
  };

  const toggleVoiceMode = () => {
    const newMode = !voiceMode;
    setVoiceMode(newMode);
    
    if (newMode) {
      // Remove showInfoMessage call
    } else {
      if (isListening) stopListening();
      if (isPlaying) handleSpeakingStop();
    }
  };

  // Handle conversation update
  const handleConversationCreated = (newConversationId: string) => {
    if (DEBUG) console.log("Dashboard: handleConversationCreated called with ID:", newConversationId);
    setConversationId(newConversationId);
    setSessionItem('currentConversationId', newConversationId);
  };

  // Effect: Load conversation on mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setMessages([]);
        
        if (currentUser) {
          // Get the authentication token
          const token = await currentUser.getIdToken();
          sessionStorage.setItem("idToken", token);
          if (DEBUG) console.log("Stored idToken in sessionStorage");
          
          // Check for existing conversation ID in session storage
          const savedConversationId = getSessionItem('currentConversationId');
          
          if (savedConversationId) {
            setConversationId(savedConversationId);
            if (DEBUG) console.log("Using saved conversation ID:", savedConversationId);
            
            try {
              await fetchConversationHistory(savedConversationId, token);
            } catch (error: any) {
              console.log("Failed to load saved conversation:", error.message);
              
              if (error.message.includes("not found") || error.message.includes("Access denied")) {
                console.log("Conversation not found or access denied - creating a new one");
                removeSessionItem('currentConversationId');
                await createNewConversation(token);
              } else {
                setError(`Error loading conversation: ${error.message}`);
              }
            }
          } else {
            // No saved conversation ID, create a new one
            if (DEBUG) console.log("No saved conversation ID found, creating a new one");
            await createNewConversation(token);
          }
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
        setError(`Failed to initialize conversation: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConversation();
  }, [currentUser]);

  // Effect: Check questionnaire completion
  useEffect(() => {
    const checkQuestionnaire = async () => {
      if (currentUser) {
        try {
          const completed = await hasCompletedQuestionnaire(currentUser.uid);
          setHasQuestionnaire(completed);
        } catch (error) {
          console.error("Error checking questionnaire status:", error);
          setHasQuestionnaire(true);
        }
      }
    };
    
    checkQuestionnaire();
  }, [currentUser]);

  // Effect: Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Effect: Update speaking state when audio stops
  useEffect(() => {
    setIsSpeaking(isPlaying);
  }, [isPlaying]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {currentUser && (
          <div className="user-info">
            <p>Logged in as: {currentUser.email}</p>
            <button 
              onClick={clearAllAndCreateNewConversation}
              disabled={loading}
              style={{ 
                marginLeft: '20px', 
                backgroundColor: loading ? '#cccccc' : '#ff9800', 
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '5px 10px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Everything'}
            </button>
          </div>
        )}
        
        {!hasQuestionnaire && (
          <div className="questionnaire-prompt">
            <h3>Personalize Your AI Assistant</h3>
            <p>We noticed you haven't completed the questionnaire yet. This helps tailor your AI assistant to your specific learning needs.</p>
            <button 
              onClick={() => navigate('/questionnaire')}
              className="questionnaire-button"
            >
              Complete Questionnaire
            </button>
          </div>
        )}
        
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <div>
              <button onClick={() => setError(null)}>Dismiss</button>
              <button 
                onClick={clearAllAndCreateNewConversation} 
                style={{ marginLeft: '10px', backgroundColor: '#ff9800', color: 'white' }}
              >
                Reset Everything
              </button>
            </div>
          </div>
        )}
        
        <div className="dashboard-grid">
          <div className="conversation-container">
            <div className="messages-container">
              {loading ? (
                <div className="loading-messages">
                  <p>Loading conversation...</p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender.toLowerCase()}`}>
                    <div className="message-sender">{msg.sender === 'user' ? 'You' : 'AI Assistant'}</div>
                    <div className="message-text">{msg.text || msg.content}</div>
                  </div>
                ))
              ) : (
                <div className="empty-messages">
                  <p>Start a conversation by typing a message below!</p>
                  <p>Or click the microphone icon to speak your question.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="input-area">
              {/* @ts-ignore - We're using the declaration file but TypeScript doesn't recognize it */}
              <TextInput
                ref={textInputRef}
                conversationId={conversationId}
                onConversationCreated={handleConversationCreated}
                onSendMessage={handleSendMessage}
                onResponseReceived={handleResponseReceived}
                onSpeakingStart={handleSpeakingStart}
                onSpeakingStop={handleSpeakingStop}
                label="Ask me anything..."
              />
            </div>
          </div>
          
          <div className="avatar-container">
            <div className="control-buttons">
              {isListening ? (
                <IconButton 
                  className="stop-button" 
                  onClick={handleStopListening}
                  style={{ backgroundColor: '#ff5252' }}
                >
                  <StopIcon />
                </IconButton>
              ) : (
                <IconButton 
                  className="mic-button" 
                  onClick={handleStartListening}
                  disabled={isPlaying}
                  style={{ backgroundColor: 'white' }}
                >
                  <MicIcon />
                </IconButton>
              )}
              
              <IconButton 
                className="voice-mode-button" 
                onClick={toggleVoiceMode}
                style={{ 
                  backgroundColor: voiceMode ? '#4caf50' : 'white',
                  color: voiceMode ? 'white' : '#620062'
                }}
              >
                {voiceMode ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
              
              {isSpeaking && (
                <IconButton 
                  className="stop-speaking-button" 
                  onClick={handleSpeakingStop}
                  style={{ backgroundColor: '#ff9800' }}
                >
                  <StopIcon />
                </IconButton>
              )}
            </div>
            
            <Avatar isSpeaking={isSpeaking} />
            
            {isListening && (
              <div className="listening-indicator">
                <span className="listening-indicator-text">
                  {transcript ? transcript : "Listening..."}
                </span>
                <div className="audio-wave">
                  <div className="audio-wave-bar"></div>
                  <div className="audio-wave-bar"></div>
                  <div className="audio-wave-bar"></div>
                  <div className="audio-wave-bar"></div>
                  <div className="audio-wave-bar"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
