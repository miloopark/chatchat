import "dotenv/config";
import express from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletion";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS
app.use("/api", textCompletionRoute); // Correctly mounted

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
