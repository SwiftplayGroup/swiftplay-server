/*
_id 67eef7055bae0efbc3968f0f
user "id"
content "Cmich Valorant A team is awesome"
forum: "id"
date "{time stamp}"
tags Array (2)
views "100"
likeCount "23"
isDeleted false
*/

import { Router } from "express";
import threadsRouter from "./threads/[threadID].js";
import database from "#utils/database-generator.js";

const router = Router();

router.use("/threads", threadsRouter);

router.get("/", async (req, res) => {
  try {
    const docs = await database.collection("threads").find().toArray();
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      _id,
      user,
      content,
      forum,
      date,
      tags,
      views,
      likeCount,
      isDeleted,
    } = req.body;
    const thread = await database
      .collection("threads")
      .insertOne({
        _id,
        user,
        content,
        forum,
        date,
        tags,
        views,
        likeCount,
        isDeleted,
      });
    res.status(201).json(thread);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
