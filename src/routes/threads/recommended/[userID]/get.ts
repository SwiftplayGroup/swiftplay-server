import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const getRecommendedThreadsRouter = Router({
  mergeParams: true,
});

getRecommendedThreadsRouter.get(
  "/",
  async (req: Request<{ userID: string }>, res) => {
    try {
      const userID = req.params.userID;
      const user = await database
        .collection("users")
        .findOne({ _id: new ObjectId(userID) });
      if (!user) {
        throw new InternalServerError();
      }
      const userEmbeddings = user.embeddings[0].values;
      if (!userEmbeddings) {
        throw new InternalServerError();
        //for now this works, in the future return the top threads.
      }
      const recommendedThreads = await database
        .collection("threads")
        .aggregate([
          {
            $vectorSearch: {
              index: "ThreadsVectorIndex",
              path: "embeddings.values",
              queryVector: userEmbeddings,
              numCandidates: 100,
              limit: 10,
              similarity: "cosine",
            },
          },
        ])
        .toArray();
      console.log(recommendedThreads);
      res.status(200).json({ recommendedThreads });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

export default getRecommendedThreadsRouter;
