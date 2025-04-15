import { Router } from "express";
import getForumRouter from "./get.js";
import threadsRouter from "./threads/index.js";

const forumRouter = Router({
  mergeParams: true,
});

forumRouter.use("/", getForumRouter);
forumRouter.use("/threads", threadsRouter);

export default forumRouter;
