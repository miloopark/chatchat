import "dotenv/config";
import express from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletion";
import validateFirebaseIdToken from './middleware/validateFirebaseToken';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS
app.use("/api", textCompletionRoute); // Correctly mounted


app.get('/api/secure-data', validateFirebaseIdToken, (req, res) => {
  res.json({ message: 'This is secure data accessible only by authenticated users.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
