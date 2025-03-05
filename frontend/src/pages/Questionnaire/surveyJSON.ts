export const json = {
  title: "User Profile Setup",
  description: "Please answer the following questions to help us personalize your experience.",
  logoPosition: "right",
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "radiogroup",
          name: "is_guardian",
          title: "Are you the legal guardian of the user?",
          isRequired: true,
          choices: [
            { value: "yes", text: "Yes" },
            { value: "no", text: "No" }
          ]
        },
        {
          type: "text",
          name: "preferred_name",
          title: "Preferred name?",
          isRequired: true,
          placeHolder: "Enter preferred name"
        },
        {
          type: "radiogroup",
          name: "gender",
          title: "Gender?",
          isRequired: true,
          choices: [
            { value: "male", text: "Male" },
            { value: "female", text: "Female" },
            { value: "other", text: "Other" },
            { value: "prefer_not_to_say", text: "Prefer not to say" }
          ]
        }
      ]
    },
    {
      name: "page2",
      elements: [
        {
          type: "dropdown",
          name: "grade_level",
          title: "Grade Level?",
          isRequired: true,
          choices: [
            { value: "K", text: "Kindergarten" },
            { value: "1", text: "1st Grade" },
            { value: "2", text: "2nd Grade" },
            { value: "3", text: "3rd Grade" },
            { value: "4", text: "4th Grade" },
            { value: "5", text: "5th Grade" },
            { value: "6", text: "6th Grade" }
          ]
        },
        {
          type: "radiogroup",
          name: "avatar_speaking_style",
          title: "How would you like your avatar to speak back to you?",
          isRequired: true,
          choices: [
            { value: "friendly", text: "Friendly and casual" },
            { value: "strict", text: "Strict and direct" },
            { value: "encouraging", text: "Encouraging and supportive" },
            { value: "educational", text: "Educational and informative" },
            { value: "funny", text: "Funny and playful" }
          ]
        },
        {
          type: "comment",
          name: "additional_info",
          title: "Is there anything else you'd like your avatar to know about your character so that they can fit you better?",
          placeHolder: "Share any additional preferences or information here..."
        }
      ]
    }
  ],
  showQuestionNumbers: "off",
  completeText: "Submit",
  showPrevButton: true,
  showProgressBar: "bottom",
  progressBarType: "buttons"
}; 