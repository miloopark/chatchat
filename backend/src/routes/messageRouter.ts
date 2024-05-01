import express from "express";
import {
  validateFirebaseIdToken,
  AuthRequest,
} from "../middleware/validateFirebaseToken";
import { storeMessage } from "../services/conversationService";

const router = express.Router();

router.post(
  "/store-message",
  validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
    const { conversationId, messageText, sender } = req.body;

    if (!conversationId || !messageText || !sender) {
      return res
        .status(400)
        .send(
          "Missing required fields: conversationId, messageText, and sender are required.",
        );
    }

    try {
      const messageId = await storeMessage({
        conversationId,
        sender,
        messageText,
      });
      return res
        .status(200)
        .send(`Message stored successfully with ID: ${messageId}`);
    } catch (error) {
      console.error("Failed to store message:", error);
      // Checking if the error is an instance of Error
      if (error instanceof Error) {
        return res.status(500).send(error.message);
      } else {
        return res.status(500).send("Internal Server Error");
      }
    }
  },
);

export default router;
