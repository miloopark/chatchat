import React from "react";
import "./Transcript.css"; // Assuming you will define styles similar to the other components

interface TranscriptProps {
  transcript: string;
}

const Transcript: React.FC<TranscriptProps> = ({ transcript }) => {
  return (
    <div className="transcript-container">
      {transcript ? (
        <p>{transcript}</p>
      ) : (
        <p className="empty-transcript">Your speech will appear here when you speak...</p>
      )}
    </div>
  );
};

export default Transcript;
