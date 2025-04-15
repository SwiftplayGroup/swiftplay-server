import { Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const createLikeRouter = Router({
  mergeParams: true,
});

createLikeRouter.post("/", async (req, res) => {
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

export default createLikeRouter;