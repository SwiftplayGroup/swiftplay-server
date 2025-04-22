import { Router } from "express";
import getPostsRouter from "./get.js";
import createPostInThreadRouter from "./post.js";

const postsRouter = Router({
  mergeParams: true,
});

postsRouter.use("/", getPostsRouter);
postsRouter.use("/", createPostInThreadRouter);

export default postsRouter;
