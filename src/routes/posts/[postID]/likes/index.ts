import { Router } from "express";
import getLikesRouter from "./get.js";
import createLikeRouter from "./post.js";

const likesRouter = Router({
  mergeParams: true,
});

likesRouter.use("/", getLikesRouter);
likesRouter.use("/", createLikeRouter);

export default likesRouter;
