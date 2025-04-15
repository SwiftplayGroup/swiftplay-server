import { Router, Request } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const deleteLikeRouter = Router({
  mergeParams: true,
});

deleteLikeRouter.delete("/", async (req: Request<{ LikeID: string }>, res) => {
  const likeID = req.params.LikeID;
  const like = await database
    .collection("likes")
    .findOne({ _id: new ObjectId(likeID) });
  if (!like) return res.status(404).send("Like not found");
  await database.collection("likes").deleteOne({ _id: new ObjectId(likeID) });
  res.send({ message: "Like deleted" });
});

export default deleteLikeRouter;
