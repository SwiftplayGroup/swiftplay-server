/**
 * Create a thread on a specific forum.
 *
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";
import Forum from "#classes/Forum.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { ForumNotFoundError } from "#classes/errors/ForumNotFoundError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import database from "#utils/database-generator.js";

const createThreadRouter = Router({
  mergeParams: true,
});

createThreadRouter.use("/", authenticator);
createThreadRouter.post(
  "/",
  async (
    req: Request<
      { forumID: string },
      unknown,
      { title: unknown; content: unknown }
    >,
    res: AuthenticatedResponse
  ) => {
    try {
      // Verify inputs.
      if (typeof req.body.title !== "string" || req.body.title.length > 64) {
        throw new BadRequestError(
          "Title must be a string at most 64 characters long."
        );
      }

      if (
        typeof req.body.content !== "string" ||
        req.body.content.length > 2048
      ) {
        throw new BadRequestError(
          "Content must be a string at most 2048 characters long."
        );
      }

      // Create thread and post.
      const forum = await Forum.getFromID(req.params.forumID);
      const zeroVector = new Array(1536).fill(0);
      const thread = await forum.createThread({
        title: req.body.title,
        authorID: res.locals.user._id,
        embeddings: zeroVector,
      });

      const post = await thread.createPost({
        authorID: res.locals.user._id,
        content: req.body.content,
        embeddings: zeroVector,
      });

      await thread.edit({
        $set: {
          mainPostID: post._id,
        },
      });

      // Generate embeddings for the thread
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: "gemini-embedding-exp-03-07",
      });
      const embeddingResult = await model.embedContent(
        req.body.title + " " + req.body.content
      );
      const embeddings = embeddingResult.embedding.values;

      // Update thread with embeddings
      await database
        .collection("threads")
        .updateOne({ _id: thread._id }, { $set: { embeddings } });

      // Return the thread.
      res.status(201).json({
        ...thread,
        mainPostID: post._id,
      });
    } catch (error) {
      if (
        error instanceof InternalServerError ||
        error instanceof ForumNotFoundError ||
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
  }
);

export default createThreadRouter;
