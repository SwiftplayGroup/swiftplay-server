import { Router } from "express";
import database from "#utils/database-generator.js";

const getPostsRouter = Router();

getPostsRouter.get("/", async (req, res) => {
  try {
    const docs = await database.collection("posts").find().toArray();
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default getPostsRouter;
