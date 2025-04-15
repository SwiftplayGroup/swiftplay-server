import { Router } from "express";
import database from "#utils/database-generator.js";

const getLikesRouter = Router({
  mergeParams: true,
});

getLikesRouter.get("/", async (req, res) => {
  try {
    const docs = await database.collection("likes").find().toArray();
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default getLikesRouter;