import express from 'express';
import { validateFirebaseIdToken, AuthRequest } from '../middleware/validateFirebaseToken';
import { getOrCreateConversation, fetchConversations } from '../services/conversationService';

const router = express.Router();

router.post("/conversation", validateFirebaseIdToken, async (req: AuthRequest, res) => {
    if (req.user) {
        try {
            const subject = req.body.subject; // Ensure the subject is sent in the request body
            if (!subject) {
                return res.status(400).send("Subject is required.");
            }
            // Use the UID from the authenticated user and the provided subject
            const conversationId = await getOrCreateConversation(req.user.uid, subject);

            return res.status(200).json({ conversationId: conversationId, message: "Conversation retrieved or created successfully" });
        } catch (error) {
            console.error("Failed to retrieve or create conversation:", error);
            return res.status(500).send("Internal Server Error");
        }
    } else {
        return res.status(403).send("Unauthorized");
    }
});

router.get("/conversations", validateFirebaseIdToken, async (req: AuthRequest, res) => {
  if (req.user) {
      try {
          const userId = req.user.uid; // Assuming the user's UID is available from the AuthRequest
          const conversations = await fetchConversations(userId);
          res.status(200).json(conversations);
      } catch (error) {
          console.error("Failed to fetch conversations:", error);
          res.status(500).send("Internal Server Error");
      }
  } else {
      res.status(403).send("Unauthorized");
  }
});

export default router;
