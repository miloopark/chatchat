import * as functions from "firebase-functions";
import express, {Response} from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletion";
import {storeOrUpdateUser} from "./services/storeOrUpdateUser";
import {validateFirebaseIdToken,
  AuthRequest} from "./middleware/validateFirebaseToken";
import { conversationService } from './services/conversationService';

const app = express();

app.use(express.json());
app.use(cors());

// Mount the textCompletionRoute under "/api"
app.use("/api", textCompletionRoute);

// Route for storing/updating user data upon login
app.post("/api/store-user", validateFirebaseIdToken,
  async (req: AuthRequest, res: Response) => {
    console.log("Received request to store/update user");
    if (req.user) {
      console.log("User authenticated", req.user.uid);
      try {
        await storeOrUpdateUser({
          uid: req.user.uid,
          email: req.user.email || "",
          displayName: req.user.name || "",
          photoURL: req.user.picture || "",
        });
        console.log("User stored/updated successfully in Firestore");
        res.status(200).send("User stored/updated successfully");
      } catch (error) {
        console.error("Failed to store/update user:", error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      console.log("User not authenticated");
      res.status(403).send("Unauthorized");
    }
  });

  // Route for storing a new message in a conversation
  app.post('/api/conversation', validateFirebaseIdToken, async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(403).send('Unauthorized'); // Ensures a response is sent
    }
  
    const { conversationId, message } = req.body;
    if (!conversationId || !message) {
      return res.status(400).send('Missing required fields'); // Ensures a response is sent
    }
  
    try {
      await conversationService.createOrUpdateConversation(conversationId, req.user.uid, message);
      res.status(200).send({ message: 'Message added to conversation successfully' }); // Sends a response
    } catch (error) {
      console.error('Error adding message to conversation:', error);
      res.status(500).send('Internal Server Error'); // Sends a response
    }
  });
  

  app.get('/api/conversation/:conversationId', validateFirebaseIdToken, async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(403).send('Unauthorized'); // Ensures a response is sent
    }
  
    const { conversationId } = req.params;
  
    try {
      const conversation = await conversationService.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).send({ message: 'Conversation not found' }); // Ensures a response is sent
      }
      res.status(200).json(conversation); // Sends a response
    } catch (error) {
      console.error('Error retrieving conversation:', error);
      res.status(500).send('Internal Server Error'); // Sends a response
    }
  });  

// If you have other secure routes, ensure they are mounted correctly
app.get("/api/secure-data",
  validateFirebaseIdToken, (req: AuthRequest, res) => {
    res.json({message: "Data accessible only by authenticated users."});
  });

exports.api = functions.https.onRequest(app);
