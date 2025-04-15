import { Router, Request } from "express";
import database from "#utils/database-generator.js";

const getThreadsRouter = Router({
  mergeParams: true,
});

getThreadsRouter.get("/", async (req: Request<{ forumID: string }>, res) => {
  const forumID = req.params.forumID;
  const threads = await database
    .collection("threads")
    .find({ forum: forumID })
    .toArray();
  res.send(threads);
});

export default getThreadsRouter;
