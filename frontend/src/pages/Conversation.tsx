import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TextInput from "../components/Dashboard/TextInput";
import Avatar from "../components/Dashboard/Avatar";
import "../components/Dashboard/Transcript.css";
import landingbackdrop from "../assets/dashboardBG.svg";
import "../App.css";
import fetchUserData from "../services/fetchUserData";

const ConversationPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversationDetails, setConversationDetails] = useState({});
  const [userData, setUserData] = useState({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const conversationResponse = await fetch(
          `/api/conversation/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("idToken")}`,
            },
          },
        );
        const userDataResponse = await fetchUserData(); // Assuming fetchUserData requires conversationId or adjust as needed

        if (conversationResponse.ok && userDataResponse) {
          const conversationData = await conversationResponse.json();
          setConversationDetails(conversationData);
          setUserData(userDataResponse);

        } else {
          console.error("Failed to fetch conversation or user details");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [conversationId]);

  useEffect(() => {
    // This useEffect will only trigger once when the component mounts
    console.log("Conversation details:", conversationDetails);
    console.log("User data:", userData);
    if (
      conversationDetails &&
      conversationDetails.details &&
      userData &&
      userData.surveyData
    ) {
      console.log(conversationDetails.details.subject);
      console.log(userData.surveyData.question2);
      speakOutLoud(
        `Hi ${userData.surveyData.question2}, my name is Kevin, your bestfriend! I'm super duper good at ${conversationDetails.details.subject}! Do you need help with anything?`,
      );
    }
  }, [conversationDetails]); // Dependency on isLoading and conversationDetails ensures it runs only after they are updated from fetchData

  const speakOutLoud = (text) => {
    axios
      .post("/api/text-to-speech", { text }, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const audio = new Audio(url);
        audio.play();
        setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
      })
      .catch((error) => console.error("Error speaking:", error));
  };

  return (
    <div className="dashboard-container">
      <img
        src={landingbackdrop}
        alt="Conversation Background"
        className="dash-backdrop"
      />
      <Button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          top: "50px",
          left: "40px",
          zIndex: 5000,
          color: "white",
        }}
      >
        <ArrowBackIcon />
      </Button>
      <div className="chat-layout">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            <TextInput
              onResponseReceived={(message) =>
                console.log("Received message:", message)
              }
              conversationId={conversationId}
              subject={conversationDetails.details.subject}
            />
            <div className="avatar-container">
              <Avatar isSpeaking={isSpeaking} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationPage;
