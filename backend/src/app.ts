import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import textCompletionRoute from "./routes/textCompletionRouter";
import storeMessageRoute from "./routes/messageRouter";
import conversationRoutes from "./routes/conversationRouter";
import userRoutes from "./routes/userRouter";
import textToSpeechRoute from "./routes/speechRouter";
import {validateFirebaseIdToken} from "./middleware/validateFirebaseToken";

// Load environment variables from .ENV file (specify exact path)
dotenv.config({ path: path.resolve(__dirname, '../.ENV') });

const app = express();

app.use(express.json());
app.use(cors());

// Log environment configuration (safely)
console.log('Environment configuration:');
console.log(`- PORT: ${process.env.PORT || 3000}`);
if (process.env.VITE_OPENAI_API_KEY) {
  const masked = `${process.env.VITE_OPENAI_API_KEY.substring(0, 10)}...${process.env.VITE_OPENAI_API_KEY.substring(process.env.VITE_OPENAI_API_KEY.length - 4)}`;
  console.log(`- OpenAI API Key: ${masked}`);
} else {
  console.log('⚠️ WARNING: VITE_OPENAI_API_KEY is not set');
}

// Mount the routes
app.use("/api", textCompletionRoute);
app.use("/api", storeMessageRoute);
app.use("/api", conversationRoutes);
app.use("/api", userRoutes); // Mount the user routes
app.use("/api", textToSpeechRoute);

app.get("/api/secure-data", validateFirebaseIdToken, (req, res) => {
  res.json({message: "Data accessible only by authenticated users."});
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create conversation endpoint
app.post('/api/conversation', (req, res) => {
  // For testing, just return a random conversation ID
  const conversationId = `conv_${Math.random().toString(36).substring(2, 15)}`;
  res.status(200).json({ conversationId });
});

// Get conversation history
app.get('/api/conversation/:id', (req, res) => {
  // For testing, just return an empty history
  res.status(200).json({ 
    conversationId: req.params.id,
    history: []
  });
});

export default app;
