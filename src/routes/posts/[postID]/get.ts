import { Router, Request } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const getPostRouter = Router({
  mergeParams: true,
});

getPostRouter.get("/", async (req: Request<{ postID: string }>, res) => {
  const postID = req.params.postID;
  const post = await database
    .collection("posts")
    .findOne({ _id: new ObjectId(postID) });
  if (!post) return res.status(404).send("Post not found");
  res.send(post);
});

export default getPostRouter;
