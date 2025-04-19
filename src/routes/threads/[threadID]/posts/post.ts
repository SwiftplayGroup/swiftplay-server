import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { ThreadNotFoundError } from "#classes/errors/ThreadNotFoundError.js";
import Post from "#classes/Post.js";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

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

      await database.collection("posts").insertOne({
        authorID: post.authorID,
        content: post.content,
        threadID: new ObjectId(threadID),
        forumID: thread.forumID,
        parentPostID: post.parentPostID,
        embeddings: zeroVector,
      });
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const embedResult = await ai.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        content: post.content,
      });
      console.log(embedResult);
      const embeddings = embedResult.embeddings;
      await database
        .collection("posts")
        .updateOne({ _id: post._id }, { $set: { embeddings } });
      res.status(201).json({ ...thread });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

export default createPostRouter;
