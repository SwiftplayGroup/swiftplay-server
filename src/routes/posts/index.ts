/*
_id 67eef7055bae0efbc3968f0f
user "id"
content "Cmich Valorant A team is awesome"
date "{time stamp}"
parentThread: "id"
parentPost "id" (this is for replies / nested replies)
tags Array (2)
views "100"
likeCount "23"
isDeleted false
*/

import { Router } from "express";
import postsRouter from "./[postID]/index.js";
import database from "#utils/database-generator.js";

const router = Router();

router.use("/posts", postsRouter);

router.get("/", async (req, res) => {
  try {
    const docs = await database.collection("posts").find().toArray();
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
      .collection("posts")
      .insertOne({ title, description });
    res.status(201).json(forum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
