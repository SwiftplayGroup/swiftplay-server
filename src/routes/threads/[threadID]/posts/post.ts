import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { ThreadNotFoundError } from "#classes/errors/ThreadNotFoundError.js";
import Post from "#classes/Post.js";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

const createPostRouter = Router({
  mergeParams: true,
});

createPostRouter.post(
  "/",
  async (req: Request<{ threadID: string; post: Post }>, res) => {
    try {
      const threadID = req.params.threadID;
      const post = req.body.post;

      if (!post) {
        throw new InternalServerError();
      }
      const thread = await database
        .collection("threads")
        .findOne({ _id: new ObjectId(threadID) });
      if (!thread) {
        throw new ThreadNotFoundError("Thread not found");
      }
      const zeroVector = new Array(1536).fill(0);

      const result = await database.collection("posts").insertOne({
        authorID: post.authorID,
        content: post.content,
        threadID: threadID,
        forumID: thread.forumID,
        parentPostID: post.parentPostID,
        embeddings: zeroVector,
      });

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: "gemini-embedding-exp-03-07",
      });
      const embeddingResult = await model.embedContent(post.content);
      const embeddings = embeddingResult.embedding.values;

      await database
        .collection("posts")
        .updateOne({ _id: result.insertedId }, { $set: { embeddings } });

      res.status(201).json({ postID: result.insertedId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
