import express from 'express';
import cors from 'cors';
import textCompletionRoute from './routes/textCompletionRoutes';
import storeMessageRoute from './routes/messageRoutes';
import storeConversationRoute from './routes/conversationRoutes';
import fetchConversationsRoute from './routes/conversationRoutes';
import userRoutes from './routes/userRoutes';
import { validateFirebaseIdToken } from './middleware/validateFirebaseToken';

const app = express();

app.use(express.json());
app.use(cors());

// Mount the routes
app.use("/api", textCompletionRoute);
app.use("/api", storeMessageRoute);
app.use("/api", storeConversationRoute);
app.use("/api", fetchConversationsRoute);
app.use("/api", userRoutes); // Mount the user routes

app.get("/api/secure-data", validateFirebaseIdToken, (req, res) => {
  res.json({ message: "Data accessible only by authenticated users." });
});

export default app;
