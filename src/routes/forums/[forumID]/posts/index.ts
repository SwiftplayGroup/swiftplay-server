import { Router } from "express";
import getPostsRouter from "./get.js";
import createPostRouter from "./post.js";

const postsRouter = Router({
  mergeParams: true,
});

postsRouter.use("/", createPostRouter);
postsRouter.use("/", getPostsRouter);

export default postsRouter;
