import express from 'express';
import { validateFirebaseIdToken, AuthRequest } from '../middleware/validateFirebaseToken';
import { fetchConversations } from '../services/conversationService';

const router = express.Router();

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