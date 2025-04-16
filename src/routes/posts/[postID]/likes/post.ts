/**
 * Like a post.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Post from "#classes/Post.js";
import { PostNotFoundError } from "#classes/errors/PostNotFoundError.js";

const createLikeRouter = Router({
  mergeParams: true,
});

createLikeRouter.use("/", authenticator);
createLikeRouter.post("/", async (req: Request<{ postID: string }>, res: AuthenticatedResponse) => {

  try {

    // Reply to the post.
    const post = await Post.getFromID(req.params.postID);
    const like = await post.like(res.locals.user._id);

    // Return the like.
    res.status(201).json(like);

  } catch (error) {

    if (error instanceof InternalServerError || error instanceof PostNotFoundError || error instanceof BadRequestError) {
        
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

export default createLikeRouter;
