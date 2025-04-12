import { Router, Request } from "express";
import database from "#utils/database-generator.js";

const router = Router();
//has someone liked a specific post.
router.get("/", async (req: Request, res) => {
  const { userId, postId } = req.query;

  if (typeof userId !== "string" || typeof postId !== "string") {
    return res.status(400).json({ error: "Missing userId or postId" });
  }

  try {
    const like = await database.collection("likes").findOne({ userId, postId });

    res.json({ liked: !!like });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
