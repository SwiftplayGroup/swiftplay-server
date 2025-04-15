import { Router } from "express";
import database from "#utils/database-generator.js";

const createPostRouter = Router({
  mergeParams: true,
});

createPostRouter.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    const forum = await database
      .collection("posts")
      .insertOne({ title, description });
    res.status(201).json(forum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default createPostRouter;
