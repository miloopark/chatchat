import * as functions from "firebase-functions";
import express, {Response} from "express";
import cors from "cors";
import textCompletionRoute from "./routes/textCompletion";
import {storeOrUpdateUser} from "./middleware/storeOrUpdateUser";
import {validateFirebaseIdToken,
  AuthRequest} from "./middleware/validateFirebaseToken";

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

// If you have other secure routes, ensure they are mounted correctly
app.get("/api/secure-data",
  validateFirebaseIdToken, (req: AuthRequest, res) => {
    res.json({message: "Data accessible only by authenticated users."});
  });

exports.api = functions.https.onRequest(app);
