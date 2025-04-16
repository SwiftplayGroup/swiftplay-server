import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";
import Post from "#classes/Post.js";

const createLikeRouter = Router({
  mergeParams: true,
});

createLikeRouter.use("/", authenticator);
createLikeRouter.post("/", async (req: Request<{postID: string}>, res: AuthenticatedResponse) => {
  try {
    const post = await Post.getFromID(req.params.postID);
    const like = await post.like(res.locals.user._id);
    res.status(201).json(like);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default createLikeRouter;
