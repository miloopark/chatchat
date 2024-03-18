import "dotenv/config";
import express from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletion";
import {storeOrUpdateUser} from "./middleware/storeOrUpdateUser";
import {validateFirebaseIdToken,
  AuthRequest} from "./middleware/validateFirebaseToken";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS

// Mount the textCompletionRoute under "/api"
app.use("/api", textCompletionRoute);

// Specific route for storing user upon login
// In your server setup
app.post("/api/store-user", validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
  // Assuming `validateFirebaseIdToken` middleware adds a `user` object to `req`
    if (req.user) {
      try {
        const userData = {
          uid: req.user.uid,
          email: req.user.email,
          displayName: req.user.name,
          photoURL: req.user.picture,
        };

        await storeOrUpdateUser(userData);
        res.status(200).send("User stored/updated successfully");
      } catch (error) {
        console.error("Failed to store/update user:", error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  });

app.get("/api/secure-data", validateFirebaseIdToken, (req, res) => {
  res.json({message: "Data accessible only by authenticated users."});
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
