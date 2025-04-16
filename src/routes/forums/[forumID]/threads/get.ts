/**
 * Get threads from a specific forum.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Router, Request } from "express";
import Forum from "#classes/Forum.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { ForumNotFoundError } from "#classes/errors/ForumNotFoundError.js";

const getThreadsRouter = Router({
  mergeParams: true,
});

getThreadsRouter.get("/", async (req: Request<{ forumID: string }>, res) => {

  try {

    const forum = await Forum.getFromID(req.params.forumID);
    const threads = await forum.getThreads();
    res.json(threads);

  } catch (error) {
  
    if (error instanceof InternalServerError || error instanceof ForumNotFoundError) {
    
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

export default getThreadsRouter;
