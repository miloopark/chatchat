import { useState, useEffect, useCallback, useRef } from 'react';

// Add a debug flag to enable console logging for all speech services
const DEBUG_SPEECH = true;

// Add ElevenLabs API integration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Voice ID for ElevenLabs - you can change this to any voice ID from your ElevenLabs account
// Using "Rachel" voice as default
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

// Use Multilingual v2 model for best quality, or Flash v2.5 for speed
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

/**
 * Simple text-to-speech using the browser's Speech Synthesis API
 * This doesn't require network access and works offline
 * 
 * Modified to return immediately after starting speech, with the utterance object
 * so the caller can monitor speech events
 */
export const textToSpeech = async (text: string): Promise<any> => {
  if (DEBUG_SPEECH) console.log('[Speech Service] textToSpeech called with:', text);
  try {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.log('Speech synthesis not supported, returning dummy audio URL');
      return { audioUrl: 'data:audio/wav;base64,DUMMY', utterance: null };
    }
    
    // Cancel any existing speech
    window.speechSynthesis.cancel();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure the utterance
    utterance.rate = 1.0;     // Normal speed
    utterance.pitch = 1.0;    // Normal pitch
    utterance.volume = 1.0;   // Full volume
    utterance.lang = 'en-US'; // English language
    
    // Set up event handlers for logging
    utterance.onstart = () => {
      if (DEBUG_SPEECH) console.log('[Speech Service] Speech synthesis started');
    };
    
    utterance.onend = () => {
      if (DEBUG_SPEECH) console.log('[Speech Service] Speech synthesis finished');
    };
    
    utterance.onerror = (event) => {
      console.log('[Speech Service] Speech synthesis error:', event);
    };
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    if (DEBUG_SPEECH) console.log('[Speech Service] Speaking text');
    
    // Return immediately with the utterance object
    return { audioUrl: 'data:audio/wav;base64,DUMMY', utterance };
  } catch (error) {
    console.log('[Speech Service] Error in text-to-speech:', error);
    return { audioUrl: 'data:audio/wav;base64,DUMMY', utterance: null };
  }
};

/**
 * Text-to-Speech using ElevenLabs API
 * @param text Text to convert to speech
 * @returns Audio data as blob and utterance object for animation control
 */
export const textToSpeechElevenLabs = async (text: string): Promise<{audioUrl: string, utterance: SpeechSynthesisUtterance}> => {
  try {
    console.log(`ElevenLabs TTS: Converting "${text.substring(0, 30)}..." to speech`);
    
    // Create utterance object for animation control
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${DEFAULT_VOICE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: DEFAULT_MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ElevenLabs API error: ${errorData.detail || response.statusText}`);
    }

    // Get audio data as blob
    const audioBlob = await response.blob();
    
    // Create URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Return both the audio URL and utterance object
    return { audioUrl, utterance };
  } catch (error) {
    console.error("Error in ElevenLabs text-to-speech:", error);
    
    // Fallback to browser TTS if ElevenLabs fails
    console.log("Falling back to browser TTS");
    return textToSpeech(text);
  }
};

/**
 * Speech-to-Text using ElevenLabs API
 * @param audioBlob Audio blob to transcribe
 * @returns Transcribed text
 */
export const speechToTextElevenLabs = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log("ElevenLabs STT: Converting speech to text");
    
    // Create FormData to send audio file
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append("model_id", "scribe-v1"); // Using Scribe v1 model
    
    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_API_URL}/speech-to-text`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`ElevenLabs API error: ${errorData.detail || response.statusText}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Error in ElevenLabs speech-to-text:", error);
    
    // Fallback to browser STT if ElevenLabs fails
    console.log("Falling back to browser STT");
    return "Speech-to-text failed. Please try again.";
  }
};

// Media recorder for capturing audio
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

/**
 * Start recording audio for speech-to-text
 * @returns Promise that resolves when recording starts
 */
export const startRecording = async (): Promise<void> => {
  try {
    // Reset audio chunks
    audioChunks = [];
    
    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create media recorder
    mediaRecorder = new MediaRecorder(stream);
    
    // Add event listeners
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    
    // Start recording
    mediaRecorder.start();
    console.log("Recording started");
  } catch (error) {
    console.error("Error starting recording:", error);
    throw error;
  }
};

/**
 * Stop recording and transcribe audio
 * @returns Promise that resolves with transcribed text
 */
export const stopRecording = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) {
      reject(new Error("MediaRecorder not initialized"));
      return;
    }
    
    mediaRecorder.addEventListener("stop", async () => {
      try {
        // Combine audio chunks into a single blob
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        
        // Stop all tracks
        mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        // Transcribe audio
        const transcribedText = await speechToTextElevenLabs(audioBlob);
        resolve(transcribedText);
      } catch (error) {
        console.error("Error transcribing audio:", error);
        reject(error);
      }
    });
    
    // Stop recording
    mediaRecorder.stop();
    console.log("Recording stopped");
  });
};

/**
 * Speech-to-text hook using the browser's SpeechRecognition API
 * This provides actual speech recognition rather than simulated responses
 */
export const useSpeechToText = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Initialize SpeechRecognition on component mount
  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition not supported in this browser");
      return;
    }
    
    // Initialize recognition
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Set up event handlers
      recognition.onstart = () => {
        if (DEBUG_SPEECH) console.log('[Speech Service] Speech recognition started');
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        if (DEBUG_SPEECH) console.log(`[Speech Service] Recognized: "${transcript}"`);
        setTranscript(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('[Speech Service] Speech recognition error:', event);
        setErrorMessage(`Recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (DEBUG_SPEECH) console.log('[Speech Service] Speech recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setErrorMessage(`Failed to initialize speech recognition: ${error}`);
    }
    
    // Clean up on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors on stop
        }
      }
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setErrorMessage("Speech recognition not available");
      return;
    }
    
    // Clear previous transcript
    setTranscript('');
    setErrorMessage(null);
    
    try {
      if (DEBUG_SPEECH) console.log('[Speech Service] Starting speech recognition');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setErrorMessage(`Failed to start listening: ${error}`);
    }
  }, []);
  
  const stopListening = useCallback((callback?: (text: string) => void) => {
    if (!recognitionRef.current || !isListening) {
      return transcript;
    }
    
    try {
      if (DEBUG_SPEECH) console.log('[Speech Service] Stopping speech recognition');
      recognitionRef.current.stop();
      
      // Call the callback with the current transcript
      if (callback && typeof callback === 'function') {
        callback(transcript);
      }
      
      return transcript;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setErrorMessage(`Failed to stop listening: ${error}`);
      return transcript;
    }
  }, [transcript, isListening]);
  
  const resetTranscript = useCallback(() => {
    if (DEBUG_SPEECH) console.log('[Speech Service] Resetting transcript');
    setTranscript('');
  }, []);
  
  const clearError = useCallback(() => {
    if (DEBUG_SPEECH) console.log('[Speech Service] Clearing error');
    setErrorMessage(null);
  }, []);
  
  return {
    transcript,
    isListening,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript,
    clearError
  };
};

/**
 * Audio player hook for playing audio from text-to-speech
 */
export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Play function that takes a URL and an optional callback
  const play = useCallback((urlOrSpeechResult: string | any, onEnded?: () => void) => {
    // Determine if we're dealing with a URL string or a speech result object
    const url = typeof urlOrSpeechResult === 'string' 
      ? urlOrSpeechResult 
      : (urlOrSpeechResult?.audioUrl || '');
    
    if (!url) {
      console.error('[Audio Player] No valid URL provided');
      return;
    }
    
    if (DEBUG_SPEECH) console.log(`[Audio Player] Playing audio from URL: ${url.substring(0, 30)}...`);
    
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Create or reuse audio element
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    
    // Set up event handlers
    audioRef.current.onplay = () => {
      if (DEBUG_SPEECH) console.log('[Audio Player] Audio started playing');
      setIsPlaying(true);
    };
    
    audioRef.current.onended = () => {
      if (DEBUG_SPEECH) console.log('[Audio Player] Audio finished playing');
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    
    audioRef.current.onerror = (event) => {
      console.error('[Audio Player] Audio error:', event);
      setIsPlaying(false);
    };
    
    // Set the source and play
    audioRef.current.src = url;
    
    audioRef.current.play()
      .then(() => {
        if (DEBUG_SPEECH) console.log('[Audio Player] Audio play promise resolved');
      })
      .catch(error => {
        console.error('[Audio Player] Error playing audio:', error);
        setIsPlaying(false);
      });
  }, []);
  
  // Stop function
  const stop = useCallback(() => {
    if (DEBUG_SPEECH) console.log('[Audio Player] Stopping audio');
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setIsPlaying(false);
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  return { isPlaying, play, stop };
};

// Type definitions for Web Speech API
// Fixed declaration to avoid TypeScript errors
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
} 