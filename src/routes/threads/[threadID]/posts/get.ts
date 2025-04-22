/**
 * Get all posts from a specific thread.
 *
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Router, Request, Response, NextFunction } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Thread from "#classes/Thread.js";
import { ThreadNotFoundError } from "#classes/errors/ThreadNotFoundError.js";
import { ObjectId } from "mongodb";

const getPostsRouter = Router({
  mergeParams: true,
});

getPostsRouter.get(
  "/",
  (req: Request<{ threadID: string }>, res: Response, next: NextFunction) => {
    (async () => {
      try {
        const threadID = req.params.threadID;

        if (!threadID || !ObjectId.isValid(threadID)) {
          return res.status(400).json({
            message: "Invalid thread ID format",
          });
        }

        const thread = await Thread.getFromID(threadID);
        const posts = await thread.getPosts();
        res.json(posts);
      } catch (error) {
        if (
          error instanceof InternalServerError ||
          error instanceof ThreadNotFoundError
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
    })().catch(next);
  },
);

export default getPostsRouter;
