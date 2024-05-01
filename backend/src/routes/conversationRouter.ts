import express from "express";
import {
  validateFirebaseIdToken,
  AuthRequest,
} from "../middleware/validateFirebaseToken";
import {
  getOrCreateConversation,
  fetchConversations,
  fetchConversationDetails,
} from "../services/conversationService";

const router = express.Router();

router.post(
  "/conversation",
  validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        const subject = req.body.subject;
        if (!subject) {
          return res.status(400).send("Subject is required.");
        }
        // Use the UID from the authenticated user and the provided subject
        const conversationId = await getOrCreateConversation(
          req.user.uid,
          subject,
        );

        return res.status(200).json({
          conversationId: conversationId,
          message: "Conversation retrieved or created successfully",
        });
      } catch (error) {
        console.error("Failed to retrieve or create conversation:", error);
        return res.status(500).send("Internal Server Error");
      }
    } else {
      return res.status(403).send("Unauthorized");
    }
  },
);

router.get(
  "/conversations",
  validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        const userId = req.user.uid;
        const conversations = await fetchConversations(userId);
        res.status(200).json(conversations);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "No matching conversations found."
        ) {
          console.error("Failed to fetch conversations:", error.message);
          res.status(500).send("Internal Server Error");
        }
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  },
);

router.get(
  "/conversation/:id",
  validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
    const {id} = req.params;

    if (req.user) {
      try {
        const details = await fetchConversationDetails(id);
        res.status(200).json({conversationId: id, details});
      } catch (error) {
        console.error("Failed to fetch conversation details:", error);
        if (
          error instanceof Error &&
          error.message === "Conversation not found"
        ) {
          res.status(404).send(error.message);
        } else {
          res.status(500).send("Internal Server Error");
        }
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  },
);

export default router;
