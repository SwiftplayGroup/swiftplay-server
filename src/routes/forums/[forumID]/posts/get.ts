import { Router, Request } from "express";
import database from "#utils/database-generator.js";

const getPostsRouter = Router({
  mergeParams: true,
});

getPostsRouter.get("/", async (req: Request<{ forumID: string }>, res) => {
  const forumID = req.params.forumID;
  const threadsOnly = req.query.threads_only === "true";
  const query = { 
    forumID,
    ...(threadsOnly ? {parentPostID: null} : {parentPostID: {$ne: null}})
  };
  
  const posts = await database
    .collection("posts")
    .find(query)
    .toArray();
  res.json(posts);
});

export default getPostsRouter;
