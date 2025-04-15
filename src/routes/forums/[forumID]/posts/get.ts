import { Router, Request } from "express";
import database from "#utils/database-generator.js";

const getPostsRouter = Router({
  mergeParams: true,
});

getPostsRouter.get("/", async (req: Request<{ forumID: string }>, res) => {
  const forumID = req.params.forumID;
  const posts = await database
    .collection("posts")
    .find({ forumID, ...(req.query.threads_only === "true" ? {parentPostID: null} : {}) })
    .toArray();
  res.json(posts);
});

export default getPostsRouter;
