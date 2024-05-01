import {Request, Response, NextFunction} from "express";
import {auth} from "../services/firebaseAdmin";
import {DecodedIdToken} from "firebase-admin/auth";

interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

const validateFirebaseIdToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    console.error("No token was passed as a Bearer in Auth header.");
    res.status(403).send("Unauthorized: No token provided.");
    return; // Explicit return after sending a response
  }

  const idToken = req.headers.authorization.split("Bearer ")[1];
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken;
    next(); // Continue to the next middleware
  } catch (error) {
    console.error("Error while verifying Firebase ID token:", error);
    res.status(403).send("Unauthorized: Invalid or expired token.");
    return; // Explicit return after sending a response
  }

  return;
};

export {validateFirebaseIdToken, AuthRequest};
