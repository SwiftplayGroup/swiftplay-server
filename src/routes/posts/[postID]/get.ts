/**
 * Get all threads.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Post from "#classes/Post.js";
import { PostNotFoundError } from "#classes/errors/PostNotFoundError.js";

const getPostRouter = Router({
  mergeParams: true,
});

getPostRouter.get("/", async (req: Request<{ postID: string }>, res) => {

  try {

    const thread = await Post.getFromID(req.params.postID);
    res.json(thread);

  } catch (error) {
  
    if (error instanceof InternalServerError || error instanceof PostNotFoundError) {
    
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

export default getPostRouter;
