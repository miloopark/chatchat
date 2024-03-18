import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletion";
import { storeUserUponLogin } from './middleware/storeUser'; // Adjust the import path


const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS
app.use("/api", textCompletionRoute, storeUserUponLogin); // Correctly mounted

exports.api = functions.https.onRequest(app);
