/*
{
  "_id": ObjectId,
  "userId": "user123",
  "postId": "post456",
  "createdAt": ISODate()
}
*/

import { Router } from "express";
import likesRouter from "./likes/[likeID].js";
import hasLikedRouter from "./likes/hasLiked.js";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const router = Router();

router.use("/likes", likesRouter);
router.use("/likes/hasLiked", hasLikedRouter);
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

export default router;
