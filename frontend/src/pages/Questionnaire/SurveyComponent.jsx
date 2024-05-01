import React from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { themeJson } from "./theme";
import { useNavigate } from "react-router-dom";
// import "/Users/jiehoonn/chatchat/frontend/src/index.css";
import { json } from "./questions";
import Navbar from "../../components/Navbar"; // add this in <---

function SurveyComponent() {
  const navigate = useNavigate();
  const survey = new Model(json);
  survey.applyTheme(themeJson);

  // Example frontend function to send updated survey data
  async function updateSurveyData(surveyData) {
    try {
      const response = await fetch("/api/user/update-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("idToken")}`, // Assuming you handle user authentication
        },
        body: JSON.stringify({ surveyData }),
      });

      if (response.ok) {
        console.log("Survey data updated successfully.");
        navigate("/navigation");
      } else {
        throw new Error("Failed to update survey data");
      }
    } catch (error) {
      console.error("Error updating survey data:", error);
    }
  }

  survey.onComplete.add((sender, options) => {
    updateSurveyData(sender.data);
  });
  return <Survey model={survey} />;
}

export default SurveyComponent;
