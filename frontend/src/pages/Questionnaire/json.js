export const json = {
    "title": "Questionnaire",
    "pages": [
     {
      "name": "page1",
      "elements": [
       {
        "type": "radiogroup",
        "name": "question1",
        "title": "Please confirm the following selection:",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "I confirm that I am the legal guardian of the user."
         },
         {
          "value": "Item 2",
          "text": "I am not the legal guardian of the user."
         }
        ]
       }
      ]
     },
     {
      "name": "page2",
      "elements": [
       {
        "type": "text",
        "name": "question4",
        "title": "What is the user's preferred name?",
        "isRequired": true
       }
      ]
     },
     {
      "name": "page3",
      "elements": [
       {
        "type": "dropdown",
        "name": "question3",
        "title": "Describe the user's gender:",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Male"
         },
         {
          "value": "Item 2",
          "text": "Female"
         },
         {
          "value": "Item 3",
          "text": "Other"
         }
        ]
       }
      ]
     },
     {
      "name": "page4",
      "elements": [
       {
        "type": "dropdown",
        "name": "question2",
        "title": "Please confirm the user's grade level:",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Kindergarten"
         },
         {
          "value": "Item 2",
          "text": "1st Grade"
         },
         {
          "value": "Item 3",
          "text": "2nd Grade"
         },
         {
          "value": "Item 4",
          "text": "3rd Grade"
         },
         {
          "value": "Item 5",
          "text": "4th Grade"
         },
         {
          "value": "Item 6",
          "text": "5th Grade"
         },
         {
          "value": "Item 7",
          "text": "6th Grade"
         }
        ]
       }
      ]
     },
     {
      "name": "page5",
      "elements": [
       {
        "type": "tagbox",
        "name": "question5",
        "title": "What subjects does the user enjoy the most?",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Math"
         },
         {
          "value": "Item 4",
          "text": "Science"
         },
         {
          "value": "Item 2",
          "text": "History"
         },
         {
          "value": "Item 3",
          "text": "English"
         },
         {
          "value": "Item 5",
          "text": "Writing"
         }
        ]
       }
      ]
     },
     {
      "name": "page6",
      "elements": [
       {
        "type": "tagbox",
        "name": "question6",
        "title": "What subjects does the user least enjoy?",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Math"
         },
         {
          "value": "Item 2",
          "text": "Science"
         },
         {
          "value": "Item 3",
          "text": "History"
         },
         {
          "value": "Item 4",
          "text": "English"
         },
         {
          "value": "Item 5",
          "text": "Writing"
         }
        ]
       }
      ]
     },
     {
      "name": "page7",
      "elements": [
       {
        "type": "dropdown",
        "name": "question7",
        "title": "How does the user prefer to receive answers from their personalized avatar?",
        "isRequired": true,
        "choices": [
         {
          "value": "Item 1",
          "text": "Friendly and Casual"
         },
         {
          "value": "Item 2",
          "text": "Strict and Formal"
         },
         {
          "value": "Item 3",
          "text": "Motivational"
         },
         {
          "value": "Item 4",
          "text": "Humorous"
         }
        ]
       }
      ]
     },
     {
      "name": "page8",
      "elements": [
       {
        "type": "text",
        "name": "question8",
        "title": "Is there anything else the user would like their avatar to know?"
       }
      ]
     }
    ],
    "showTitle": false,
    "headerView": "advanced"
   }