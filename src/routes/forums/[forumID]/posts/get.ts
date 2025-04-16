import { Router, Request } from "express";
import database from "#utils/database-generator.js";

const getPostsRouter = Router({
  mergeParams: true,
});

getPostsRouter.get("/", async (req: Request<{ forumID: string }>, res) => {
  const forumID = req.params.forumID;
  const type = req.query.type;
  let filter = {};
  if (type === "post") {

    filter = {
      parentPostID: {
        $ne: null
      }
    };

  } else if (type === "thread") {

    filter = {
      parentPostID: null
    };

  } else if (type !== undefined) {

    return res.status(400).json({
      message: `Type must be empty, "post", or "thread".`
    });

  }

  const query = { 
    forumID,
    ...filter
  };
  
  const posts = await database
    .collection("posts")
    .find(query)
    .toArray();
  res.json(posts);
});

export default getPostsRouter;
