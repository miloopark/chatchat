import express from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletionRouter";
import storeMessageRoute from "./routes/messageRouter";
import storeConversationRoute from "./routes/conversationRouter";
import fetchConversationsRoute from "./routes/conversationRouter";
import userRoutes from "./routes/userRouter";
import textToSpeechRoute from "./routes/speechRouter";
import { validateFirebaseIdToken } from "./middleware/validateFirebaseToken";

const app = express();

app.use(express.json());
app.use(cors());

// Mount the routes
app.use("/api", textCompletionRoute);
app.use("/api", storeMessageRoute);
app.use("/api", storeConversationRoute);
app.use("/api", fetchConversationsRoute);
app.use("/api", userRoutes); // Mount the user routes
app.use("/api", textToSpeechRoute);

app.get("/api/secure-data", validateFirebaseIdToken, (req, res) => {
  res.json({ message: "Data accessible only by authenticated users." });
});

export default app;
