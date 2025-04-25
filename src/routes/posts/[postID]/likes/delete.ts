import { Request, Router } from "express";
import Post from "#classes/Post.js";
import { PostNotFoundError } from "#classes/errors/PostNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { Filter } from "mongodb";
import { LikeProperties } from "#classes/Like.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import authenticator from "#utils/authenticator.js";
import User, { AuthenticatedResponse } from "#classes/User.js";
import { UserNotFoundError } from "#classes/errors/UserNotFoundError.js";

const deleteLikesRouter = Router({
  mergeParams: true,
});

deleteLikesRouter.use("/", authenticator);
deleteLikesRouter.delete(
  "/",
  async (
    req: Request<{ postID: string }, undefined, { userIDs?: string[] }>,
    res: AuthenticatedResponse,
  ) => {
    try {
      const post = await Post.getFromID(req.params.postID);
      let filter: Filter<LikeProperties> = {};

      if (!req.body.userIDs) {
        filter = {
          userID: res.locals.user._id,
        };
      } else {
        filter.$or = [];
        for (const userID of req.body.userIDs) {
          if (typeof userID !== "string") {
            throw new BadRequestError("All user IDs must be strings.");
          }

          const user = await User.getFromID(userID);
          filter.$or.push({
            userID: user._id,
          });
        }
      }

      await post.deleteLike(filter);

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      if (
        error instanceof InternalServerError ||
        error instanceof UserNotFoundError ||
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

export default deleteLikesRouter;
