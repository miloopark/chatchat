export const json = {
  title: "Questionnaire",
  pages: [
    {
      name: "page1",
      elements: [
        {
          type: "radiogroup",
          name: "question1",
          title: "Please confirm the following selection:",
          isRequired: true,
          choices: [
            {
              value: true,
              text: "I confirm that I am the legal guardian of the user.",
            },
            {
              value: false,
              text: "I am not the legal guardian of the user.",
            },
          ],
        },
      ],
    },
    {
      name: "page2",
      elements: [
        {
          type: "text",
          name: "question2",
          title: "What is the user's preferred name?",
          isRequired: true,
        },
      ],
    },
    {
      name: "page3",
      elements: [
        {
          type: "dropdown",
          name: "question3",
          title: "Describe the user's gender:",
          isRequired: true,
          choices: [
            {
              value: "Male",
              text: "Male",
            },
            {
              value: "Female",
              text: "Female",
            },
            {
              value: "Other",
              text: "Other",
            },
          ],
        },
      ],
    },
    {
      name: "page4",
      elements: [
        {
          type: "dropdown",
          name: "question4",
          title: "Please confirm the user's grade level:",
          isRequired: true,
          choices: [
            {
              value: "Kindergarten",
              text: "Kindergarten",
            },
            {
              value: "1st Grade",
              text: "1st Grade",
            },
            {
              value: "2nd Grade",
              text: "2nd Grade",
            },
            {
              value: "3rd Grade",
              text: "3rd Grade",
            },
            {
              value: "4th Grade",
              text: "4th Grade",
            },
            {
              value: "5th Grade",
              text: "5th Grade",
            },
            {
              value: "6th Grade",
              text: "6th Grade",
            },
          ],
        },
      ],
    },
    {
      name: "page5",
      elements: [
        {
          type: "dropdown",
          name: "question5",
          title:
            "How does the user prefer to receive answers from their personalized avatar?",
          isRequired: true,
          choices: [
            {
              value: "Friendly and Casual",
              text: "Friendly and Casual",
            },
            {
              value: "Strict and Formal",
              text: "Strict and Formal",
            },
            {
              value: "Motivational",
              text: "Motivational",
            },
            {
              value: "Humorous",
              text: "Humorous",
            },
          ],
        },
      ],
    },
    {
      name: "page6",
      elements: [
        {
          type: "text",
          name: "question6",
          title:
            "Is there anything else the user would like their avatar to know?",
        },
      ],
    },
  ],
  showTitle: false,
  headerView: "advanced",
};
