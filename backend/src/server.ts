import "dotenv/config";
import express from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletion";
import validateFirebaseIdToken from './middleware/validateFirebaseToken';
import { storeUserUponLogin } from './middleware/storeUser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS

// Mount the textCompletionRoute under "/api"
app.use("/api", textCompletionRoute);

// Specific route for storing user upon login
app.post('/api/store-user', storeUserUponLogin, (req, res) => {
  // If the middleware doesn't send a response, it means the user was successfully stored/updated
  res.status(200).send('User stored successfully');
});

app.get('/api/secure-data', validateFirebaseIdToken, (req, res) => {
  res.json({ message: 'This is secure data accessible only by authenticated users.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
