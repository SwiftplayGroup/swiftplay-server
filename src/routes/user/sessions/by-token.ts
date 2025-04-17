import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import argon2 from "argon2";

const router = Router({ mergeParams: true });

router.post("/", async (request: Request, response) => {
  const { refreshToken } = request.body;

  if (!refreshToken) {
    return response.status(400).json({ message: "Refresh token is required." });
  }

  const sessionsCollection = database.collection("sessions");

  try {
    // Fetch recent or valid sessions (you could filter by expirationDate if desired)
    const sessionsCursor = sessionsCollection.find({
      expirationDate: { $gte: new Date() },
    });

    const sessions = await sessionsCursor.toArray();

    // Compare provided token with each stored tokenHash
    for (const session of sessions) {
      const isValid = await argon2.verify(session.tokenHash, refreshToken);
      if (isValid) {
        // Return the session data (sanitize if needed)
        return response.status(200).json({
          session: {
            _id: session._id,
            creationDate: session.creationDate,
            expirationDate: session.expirationDate,
            accountID: session.accountID,
          },
        });
      }
    }

    return response
      .status(404)
      .json({ message: "Session not found or token invalid." });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      message: "Internal server error while looking up the session.",
    });
  }
});

export default router;
