import React from "react";
import "./Transcript.css"; // Assuming you will define styles similar to the other components

const Transcript = ({ transcript }) => {
  return (
    <div className="transcript-container">
      <p>{transcript}</p>
    </div>
  );
};

export default Transcript;
