/**
 * Create a post replying to another post.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { ForumNotFoundError } from "#classes/errors/ForumNotFoundError.js";
import Post from "#classes/Post.js";

const createReplyRouter = Router({
  mergeParams: true,
});

createReplyRouter.use("/", authenticator);
createReplyRouter.post("/", async (req: Request<{ postID: string }, unknown, {content: unknown}>, res: AuthenticatedResponse) => {

  try {

    // Verify inputs.
    if (typeof(req.body.content) !== "string" || req.body.content.length > 2048) {

      throw new BadRequestError("Content must be a string at most 2048 characters long.");

    }

    // Reply to the post.
    const post = await Post.getFromID(req.params.postID);
    const reply = await post.reply({
      authorID: res.locals.user._id,
      content: req.body.content
    });

    // Return the thread.
    res.status(201).json(reply);

  } catch (error) {

    if (error instanceof InternalServerError || error instanceof ForumNotFoundError || error instanceof BadRequestError) {
        
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

export default createReplyRouter;
