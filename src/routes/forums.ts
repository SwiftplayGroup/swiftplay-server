/*
{"_id":{"$oid":"67eedf895f7606295aefff90"},
"name":"Valorant",
"description":"community for the worst shooter ever"}
*/

import { Router } from "express";
import forumsRouter from "./forums/[forumID].js";
import database from "#utils/database-generator.js";

const router = Router();

router.use("/forums", forumsRouter);

router.get("/", async (req, res) => {
  try {
    const docs = await database.collection("forums").find().toArray();
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    const forum = await database
      .collection("forums")
      .insertOne({ title, description });
    res.status(201).json(forum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
