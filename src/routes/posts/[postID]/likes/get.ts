import { Request, Router } from "express";
import Post from "#classes/Post.js";
import { PostNotFoundError } from "#classes/errors/PostNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { Filter, ObjectId } from "mongodb";
import { LikeProperties } from "#classes/Like.js";
import isBSONError from "#utils/isBSONError.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";

const getLikesRouter = Router({
  mergeParams: true,
});

getLikesRouter.get("/", async (req: Request<{postID: string}, unknown, unknown, {["user-id"]: string | string[]}>, res) => {
  try {

    const post = await Post.getFromID(req.params.postID);
    let filter: Filter<LikeProperties> = {};

    try {

      if (typeof(req.query["user-id"]) === "string") {

        filter = {
          userID: new ObjectId(req.query["user-id"])
        };
        
      } else if (req.query["user-id"] instanceof Array) {

        filter = {
          $or: []
        };

        for (const userID of req.query["user-id"]) {

          filter.$or?.push({
            userID: new ObjectId(userID)
          });

        }

      }

    } catch (error) {

      if (isBSONError(error)) {

        throw new BadRequestError("All user IDs must be ObjectIds.");

      } else {

        throw error;

      }

    }

    const likes = await post.getLikes(filter);
    res.json(likes);

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

export default getLikesRouter;