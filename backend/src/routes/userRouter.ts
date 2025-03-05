import {Router} from "express";
import {
  storeOrUpdateUser,
  getUserData,
  updateSurveyData,
} from "../services/userService";
import {
  validateFirebaseIdToken,
  AuthRequest,
} from "../middleware/validateFirebaseToken";

const router = Router();

router.post(
  "/store-user",
  validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        const userData = {
          uid: req.user.uid,
          email: req.user.email,
          displayName: req.user.name,
          photoURL: req.user.picture,
          surveyData: {
            confirmation: false,
            name: "",
            gender: "",
            grade: "",
            learningPref: "",
            extraPref: "",
          },
        };

        const isFirstTime = await storeOrUpdateUser(userData);
        res.status(200).json({
          message: "User stored/updated successfully",
          firstTime: isFirstTime,
        });
      } catch (error) {
        console.error("Failed to store/update user:", error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  },
);

router.post(
  "/user/update-survey",
  validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        await updateSurveyData(req.user.uid, req.body.surveyData);
        res.status(200).send("Survey data updated successfully.");
      } catch (error) {
        console.error("Failed to update survey data:", error);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  },
);

router.get(
  "/get-user-data",
  validateFirebaseIdToken,
  async (req: AuthRequest, res) => {
    if (req.user) {
      try {
        const userData = await getUserData(req.user.uid);
        res.json(userData);
      } catch (error) {
        if (error instanceof Error && error.message === "User not found") {
          res.status(404).send(error.message);
        } else {
          console.error("Error fetching user data:", error);
          res.status(500).send("Internal Server Error");
        }
      }
    } else {
      res.status(403).send("Unauthorized");
    }
  },
);

// Get user profile
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // In a real app, fetch user from database
  res.status(200).json({
    userId,
    displayName: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString()
  });
});

// Update user profile
router.put('/user/:id', (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  
  if (!userData) {
    return res.status(400).json({ error: 'No user data provided' });
  }
  
  // In a real app, update user in database
  res.status(200).json({
    success: true,
    userId,
    ...userData
  });
});

export default router;
