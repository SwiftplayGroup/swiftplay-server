import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import database from "#utils/database-generator.js";

const getRecommendedThreadsRouter = Router({
  mergeParams: true,
});

getRecommendedThreadsRouter.get(
  "/",
  async (req: Request<{ userID: string }>, res) => {
    try {
      const userID = req.params.userID;
      const user = await database.collection("users").findOne({ _id: userID });
      if (!user) {
        throw new InternalServerError("User not found");
      }
      const userEmbeddings = user.embeddings;
      if (!userEmbeddings) {
        throw new InternalServerError("User embeddings not found");
        //for now this works, in the future return the top threads.
      }
      const recommendedThreads = await database
        .collection("threads")
        .aggregate([
          {
            $vectorSearch: {
              index: "RecommendedThreads",
              path: "embeddings",
              queryVector: userEmbeddings,
              numCandidates: 100,
              limit: 10,
              similarity: "cosine",
            },
          },
        ])
        .toArray();
      res.status(200).json({ recommendedThreads });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);
