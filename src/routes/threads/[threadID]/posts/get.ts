/**
 * Get all posts from a specific thread.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Thread from "#classes/Thread.js";
import { ThreadNotFoundError } from "#classes/errors/ThreadNotFoundError.js";

const getPostsRouter = Router({
  mergeParams: true,
});

getPostsRouter.get("/", async (req: Request<{ threadID: string }>, res) => {

  try {

    const thread = await Thread.getFromID(req.params.threadID);
    const posts = await thread.getPosts();
    res.json(posts);

  } catch (error) {
  
    if (error instanceof InternalServerError || error instanceof ThreadNotFoundError) {
    
      res.status(error.statusCode).json({
        message: error.message
      });

    } else {

      console.warn(error);

      const internalServerError = new InternalServerError();
      res.status(internalServerError.statusCode).json({
        message: internalServerError.message
      });

    }
  
  }

});

export default getPostsRouter;
