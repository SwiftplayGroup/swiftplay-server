import { Router, Request } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const router = Router({
  mergeParams: true,
});

router.get("/", async (req: Request<{ threadID: string }>, res) => {
  const threadID = req.params.threadID;
  const thread = await database
    .collection("threads")
    .findOne({ _id: new ObjectId(threadID) });
  if (!thread) return res.status(404).send("Thread not found");
  res.send(thread);
});

export default router;
