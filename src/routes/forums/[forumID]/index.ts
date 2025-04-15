import { Router } from "express";
import getForumRouter from "./get.js";
import postsRouter from "./posts/index.js";

const forumRouter = Router({
  mergeParams: true,
});

forumRouter.use("/", getForumRouter);
forumRouter.use("/posts", postsRouter);

export default forumRouter;
