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
import database from "#utils/database-generator.js";

const createLikeRouter = Router({
  mergeParams: true,
});

createLikeRouter.use("/", authenticator);
createLikeRouter.post(
  "/",
  async (req: Request<{ postID: string }>, res: AuthenticatedResponse) => {
    try {
      const post = await Post.getFromID(req.params.postID);
      const like = await post.like(res.locals.user._id);

      const postData = await database
        .collection("posts")
        .findOne({ _id: post._id });
      if (!postData) {
        throw new PostNotFoundError(post._id);
      }

      const user = await database
        .collection("users")
        .findOne({ _id: res.locals.user._id });
      if (!user) {
        throw new InternalServerError();
      }

      // If user has no embeddings yet, use the post's embeddings
      if (!user.embeddings) {
        await database
          .collection("users")
          .updateOne(
            { _id: res.locals.user._id },
            { $set: { embeddings: postData.embeddings } },
          );
      } else {
        // Average the user's current embeddings with the post's embeddings
        // Something to look at:
        // Date of embeddings should have a weight, that way
        // something a user liked 1 year ago doesnt effect as much as something
        // the user just liked. Maybe even expiration dates for embeds.
        const newEmbeddings = user.embeddings.map(
          (value: number, index: number) =>
            (value + postData.embeddings[index]) / 2,
        );

        await database
          .collection("users")
          .updateOne(
            { _id: res.locals.user._id },
            { $set: { embeddings: newEmbeddings } },
          );
      }

      // Return the like.
      res.status(201).json(like);
    } catch (error) {
      if (
        error instanceof InternalServerError ||
        error instanceof PostNotFoundError ||
        error instanceof BadRequestError
      ) {
        res.status(error.statusCode).json({
          message: error.message,
        });
      } else {
        console.warn(error);

        const internalServerError = new InternalServerError();
        res.status(internalServerError.statusCode).json({
          message: internalServerError.message,
        });
      }
    }
  },
);

export default createLikeRouter;
