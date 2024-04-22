import express from 'express';
import cors from 'cors';
import textCompletionRoute from './routes/textCompletion';
//import storeUserRoute from './routes/storeUser';
import storeMessageRoute from './routes/storeMessage';
import storeConversationRoute from './routes/storeConversation';
import fetchConversationsRoute from './routes/fetchConversations';
import {storeOrUpdateUser, getUserData, updateSurveyData} from "./middleware/storeOrUpdateUser";
import {validateFirebaseIdToken, AuthRequest} from "./middleware/validateFirebaseToken";

const app = express();

app.use(express.json());
app.use(cors());

// Mount the routes
app.use("/api", textCompletionRoute);
// app.use("/api", storeUserRoute);
app.use("/api", storeMessageRoute);
app.use("/api", storeConversationRoute);
app.use("/api", fetchConversationsRoute);

app.post("/api/store-user", validateFirebaseIdToken, async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        const userData = {
          uid: req.user.uid,
          email: req.user.email,
          displayName: req.user.name,
          photoURL: req.user.picture,
          surveyData: {
            confirmation: false,
            name: "",
            gender: "",
            grade: "",
            learningPref: "",
            extraPref: ""
          }
        };
  
        const isFirstTime = await storeOrUpdateUser(userData);
        res.status(200).json({ message: "User stored/updated successfully", firstTime: isFirstTime });
      } catch (error: unknown) {
        console.error("Failed to store/update user:", error);
        console.error("Error stack:", error); // More detailed error logging
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  });
  
  app.post("/api/user/update-survey", validateFirebaseIdToken, async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        await updateSurveyData(req.user.uid, req.body.surveyData);
        res.status(200).send("Survey data updated successfully.");
      } catch (error) {
        console.error("Failed to update survey data:", error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  });
  
  app.get('/api/get-user-data', validateFirebaseIdToken, async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        const userData = await getUserData(req.user.uid);
        res.json(userData); // Send the user data back to the client
      } catch (error: unknown) {
        if (error === 'User not found') {
          res.status(404).send(error);
        } else {
          console.error('Error fetching user data:', error);
          res.status(500).send('Internal Server Error');
        }
      }
    } else {
      res.status(403).send('Unauthorized');
    }
  });

// Secure route example
app.get("/api/secure-data", validateFirebaseIdToken, (req, res) => {
    res.json({message: "Data accessible only by authenticated users."});
});

export default app;