import { Router, Request } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const getForumRouter = Router({
  mergeParams: true,
});

getForumRouter.get("/", async (req: Request<{ forumID: string }>, res) => {
  const forumID = req.params.forumID;
  console.log(forumID);
  const forum = await database
    .collection("forums")
    .findOne({ _id: new ObjectId(forumID) });
  if (!forum) return res.status(404).send("Forum not found");
  res.send(forum);
});

export default getForumRouter;
