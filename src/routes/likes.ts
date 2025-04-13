/*
{
  "_id": ObjectId,
  "userId": "user123",
  "postId": "post456",
  "createdAt": ISODate()
}
*/
import { Router, Request } from "express";
import likesRouter from "./likes/[likeID].js";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const router = Router();

router.use("/likes", likesRouter);
//Get all likes
router.get("/", async (req, res) => {
  try {
    const docs = await database.collection("likes").find().toArray();
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//make a like
router.post("/", async (req, res) => {
  try {
    const { userId, threadId } = req.body;
    const forum = await database.collection("likes").insertOne({
      _id: new ObjectId(),
      userId,
      threadId,
      createdAt: new Date(),
    });
    res.status(201).json(forum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/hasLiked", async (req: Request, res) => {
  const { userId, threadId } = req.query;

  if (typeof userId !== "string" || typeof threadId !== "string") {
    return res.status(400).json({ error: "Missing userId or threadId" });
  }

  try {
    const like = await database
      .collection("likes")
      .findOne({ userId, threadId });

    res.json({ liked: !!like });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/deleteLike", async (req: Request, res) => {
  const { userId, threadId } = req.query;

  if (typeof userId != "string" || typeof threadId != "string") {
    return res.status(400).json({ error: "Missing userId or threadId" });
  }

  try {
    const like = await database
      .collection("likes")
      .deleteOne({ userId, threadId });
    res.status(201).json({ like: like, message: "Like deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;
