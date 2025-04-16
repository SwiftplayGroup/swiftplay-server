/**
 * Get all posts.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Post from "#classes/Post.js";
import getPostsRouter from "../threads/[threadID]/posts/get.js";

const getThreadsRouter = Router({
  mergeParams: true,
});

getPostsRouter.get("/", async (req: Request<{ forumID: string }>, res) => {

  try {

    const posts = await Post.find();
    res.json(posts);

  } catch (error) {
  
    if (error instanceof InternalServerError) {
    
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
