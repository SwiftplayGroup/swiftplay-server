import { Router } from "express";
import getPostsRouter from "./get.js";

const postsRouter = Router({
  mergeParams: true,
});

postsRouter.use("/", getPostsRouter);

export default postsRouter;
