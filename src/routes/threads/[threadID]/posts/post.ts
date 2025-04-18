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
        _id: new ObjectId(),
      });

      const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const embedResult = await ai.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        contents: post.content, //note that here we can specify what we want it to embed it as, to get better results
      });
      console.log(embedResult);
      const embeddings = embedResult.embedding.values;

      await database
        .collection("posts")
        .updateOne({ _id: result._id }, { $set: { embeddings } });

      res.status(201).json({ postID: result.insertedId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);
