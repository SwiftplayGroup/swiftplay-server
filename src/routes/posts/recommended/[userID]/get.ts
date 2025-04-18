import { Router, Request } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import database from "#utils/database-generator.js";

const getRecommendedPostsRouter = Router({
  mergeParams: true,
});

getRecommendedPostsRouter.get(
  "/",
  async (req: Request<{ userID: string }>, res) => {
    try {
      const userID = req.params.userID;
      const user = await database.collection("users").findOne({ _id: userID });
      if (!user) {
        throw new InternalServerError("User not found");
      }
      const userEmbeddings = user.embeddings;

      const recommendedPosts = await database
        .collection("posts")
        .aggregate([
          {
            $vectorSearch: {
              index: "ReccommendedPosts",
              path: "embeddings",
              queryVector: userEmbeddings,
              numCandidates: 100,
              limit: 10,
              similarity: "cosine",
            },
          },
        ])
        .toArray();

      res.status(200).json(recommendedPosts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);
