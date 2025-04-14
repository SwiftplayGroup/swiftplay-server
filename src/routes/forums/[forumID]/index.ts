import { Router, Request } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const router = Router({
  mergeParams: true,
});

router.get("/", async (req: Request<{ forumID: string }>, res) => {
  const forumID = req.params.forumID;
  const forum = await database
    .collection("forums")
    .findOne({ _id: new ObjectId(forumID) });
  if (!forum) return res.status(404).send("Forum not found");
  res.send(forum);
});

export default router;
