import React from "react";
import { useNavigate } from "react-router-dom";
import landingbackdrop from "../assets/landingbackdrop.svg";
import Navbar from "../components/Navbar";
import "../App.css";

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="svg-container">
      <Navbar />
      <img src={landingbackdrop} alt="Main Background" className="backdrop" />
    </div>
  );
};

export default Settings;